import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Build base queries for costs and transactions
    let costsQuery = supabase
      .from('costs')
      .select(`
        id,
        project_id,
        cost_type,
        date,
        amount_eur,
        description,
        reference_type,
        reference_id,
        created_at,
        project:projects!costs_project_id_fkey(
          id,
          name,
          city
        )
      `);

    let transactionsQuery = supabase
      .from('transactions')
      .select(`
        id,
        project_id,
        amount,
        transaction_type,
        description,
        date,
        reference_id,
        created_at,
        project:projects!transactions_project_id_fkey(
          id,
          name,
          city
        )
      `);

    // Apply filters
    if (project_id) {
      costsQuery = costsQuery.eq('project_id', project_id);
      transactionsQuery = transactionsQuery.eq('project_id', project_id);
    }

    if (start_date && end_date) {
      costsQuery = costsQuery.gte('date', start_date).lte('date', end_date);
      transactionsQuery = transactionsQuery.gte('date', start_date).lte('date', end_date);
    } else if (year) {
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;
      costsQuery = costsQuery.gte('date', yearStart).lte('date', yearEnd);
      transactionsQuery = transactionsQuery.gte('date', yearStart).lte('date', yearEnd);

      if (month) {
        const monthStr = month.padStart(2, '0');
        const monthStart = `${year}-${monthStr}-01`;
        const monthEnd = new Date(parseInt(year), parseInt(month), 0);
        const monthEndStr = `${year}-${monthStr}-${monthEnd.getDate().toString().padStart(2, '0')}`;

        costsQuery = costsQuery.gte('date', monthStart).lte('date', monthEndStr);
        transactionsQuery = transactionsQuery.gte('date', monthStart).lte('date', monthEndStr);
      }
    }

    // Execute queries
    const [costsResult, transactionsResult] = await Promise.all([
      costsQuery,
      transactionsQuery
    ]);

    if (costsResult.error) {
      console.error('Supabase costs query error:', costsResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch costs data' },
        { status: 500 }
      );
    }

    if (transactionsResult.error) {
      console.error('Supabase transactions query error:', transactionsResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions data' },
        { status: 500 }
      );
    }

    const costs = costsResult.data || [];
    const transactions = transactionsResult.data || [];

    // Calculate costs summary by type
    const costsByType = costs.reduce((acc: any, cost: any) => {
      const type = cost.cost_type || 'other';
      if (!acc[type]) {
        acc[type] = {
          type,
          total: 0,
          count: 0,
          items: []
        };
      }
      acc[type].total += Number(cost.amount_eur) || 0;
      acc[type].count += 1;
      acc[type].items.push(cost);
      return acc;
    }, {});

    // Calculate transactions summary by type
    const transactionsByType = transactions.reduce((acc: any, transaction: any) => {
      const type = transaction.transaction_type || 'expense';
      if (!acc[type]) {
        acc[type] = {
          type,
          total: 0,
          count: 0,
          items: []
        };
      }
      acc[type].total += Number(transaction.amount) || 0;
      acc[type].count += 1;
      acc[type].items.push(transaction);
      return acc;
    }, {});

    // Calculate totals
    const totalCosts = costs.reduce((sum: number, cost: any) => sum + (Number(cost.amount_eur) || 0), 0);
    const totalIncome = transactionsByType.income?.total || 0;
    const totalExpenses = transactionsByType.expense?.total || 0;
    const totalTransactions = totalIncome + totalExpenses;

    // Calculate monthly breakdown if year is specified
    let monthlyBreakdown = null;
    if (year) {
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthStr = month.toString().padStart(2, '0');

        const monthlyCosts = costs.filter((cost: any) => {
          const costDate = new Date(cost.date);
          return costDate.getMonth() + 1 === month;
        }).reduce((sum: number, cost: any) => sum + (Number(cost.amount_eur) || 0), 0);

        const monthlyIncome = transactions.filter((t: any) => {
          const tDate = new Date(t.date);
          return tDate.getMonth() + 1 === month && t.transaction_type === 'income';
        }).reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

        const monthlyExpenses = transactions.filter((t: any) => {
          const tDate = new Date(t.date);
          return tDate.getMonth() + 1 === month && t.transaction_type === 'expense';
        }).reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

        return {
          month,
          monthName: new Date(parseInt(year), i, 1).toLocaleString('en', { month: 'long' }),
          costs: monthlyCosts,
          income: monthlyIncome,
          expenses: monthlyExpenses,
          net: monthlyIncome - monthlyExpenses - monthlyCosts
        };
      });

      monthlyBreakdown = monthlyData;
    }

    // Get project summaries if no specific project is filtered
    let projectSummaries = null;
    if (!project_id) {
      const projectCosts = costs.reduce((acc: any, cost: any) => {
        const pId = cost.project_id;
        if (!acc[pId]) {
          acc[pId] = {
            project_id: pId,
            project_name: cost.project?.name || 'Unknown Project',
            project_city: cost.project?.city || '',
            total_costs: 0,
            costs_count: 0
          };
        }
        acc[pId].total_costs += Number(cost.amount_eur) || 0;
        acc[pId].costs_count += 1;
        return acc;
      }, {});

      const projectTransactions = transactions.reduce((acc: any, transaction: any) => {
        const pId = transaction.project_id;
        if (!acc[pId]) {
          acc[pId] = {
            project_id: pId,
            project_name: transaction.project?.name || 'Unknown Project',
            project_city: transaction.project?.city || '',
            total_income: 0,
            total_expenses: 0,
            transactions_count: 0
          };
        }
        if (transaction.transaction_type === 'income') {
          acc[pId].total_income += Number(transaction.amount) || 0;
        } else {
          acc[pId].total_expenses += Number(transaction.amount) || 0;
        }
        acc[pId].transactions_count += 1;
        return acc;
      }, {});

      // Merge project data
      const allProjectIds = new Set([
        ...Object.keys(projectCosts),
        ...Object.keys(projectTransactions)
      ]);

      projectSummaries = Array.from(allProjectIds).map(pId => {
        const costData = projectCosts[pId] || {};
        const transactionData = projectTransactions[pId] || {};

        return {
          project_id: pId,
          project_name: costData.project_name || transactionData.project_name || 'Unknown Project',
          project_city: costData.project_city || transactionData.project_city || '',
          total_costs: costData.total_costs || 0,
          total_income: transactionData.total_income || 0,
          total_expenses: transactionData.total_expenses || 0,
          net_profit: (transactionData.total_income || 0) - (transactionData.total_expenses || 0) - (costData.total_costs || 0),
          costs_count: costData.costs_count || 0,
          transactions_count: transactionData.transactions_count || 0
        };
      });
    }

    // Recent activity (last 10 items)
    const recentActivity = [
      ...costs.map((cost: any) => ({
        id: cost.id,
        type: 'cost',
        subtype: cost.cost_type,
        amount: Number(cost.amount_eur) || 0,
        description: cost.description || `${cost.cost_type} cost`,
        date: cost.date,
        project: cost.project?.name || 'Unknown Project',
        created_at: cost.created_at
      })),
      ...transactions.map((transaction: any) => ({
        id: transaction.id,
        type: 'transaction',
        subtype: transaction.transaction_type,
        amount: Number(transaction.amount) || 0,
        description: transaction.description || `${transaction.transaction_type} transaction`,
        date: transaction.date,
        project: transaction.project?.name || 'Unknown Project',
        created_at: transaction.created_at
      }))
    ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

    return NextResponse.json({
      summary: {
        total_costs: totalCosts,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        total_transactions: totalTransactions,
        net_profit: totalIncome - totalExpenses - totalCosts,
        costs_count: costs.length,
        transactions_count: transactions.length
      },
      costs_by_type: Object.values(costsByType).map((item: any) => ({
        type: item.type,
        total: item.total,
        count: item.count,
        percentage: totalCosts > 0 ? ((item.total / totalCosts) * 100).toFixed(2) : 0
      })),
      transactions_by_type: Object.values(transactionsByType).map((item: any) => ({
        type: item.type,
        total: item.total,
        count: item.count,
        percentage: totalTransactions > 0 ? ((item.total / totalTransactions) * 100).toFixed(2) : 0
      })),
      monthly_breakdown: monthlyBreakdown,
      project_summaries: projectSummaries,
      recent_activity: recentActivity,
      filters: {
        project_id,
        start_date,
        end_date,
        year,
        month
      }
    });
  } catch (error) {
    console.error('Financial summary API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}