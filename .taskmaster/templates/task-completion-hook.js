#!/usr/bin/env node

/**
 * Task Completion Hook for COMETA Documentation Agent
 * Автоматически запускается после завершения задач в Task Master
 * Интегрируется с Task Master через webhook или polling
 */

const COMETADocumentationAgent = require('./documentation-agent.js');

class TaskCompletionHook {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.agent = new COMETADocumentationAgent(projectRoot);
  }

  /**
   * Обработчик завершения задачи
   */
  async onTaskCompleted(taskData) {
    console.log(`🎯 Task completed: ${taskData.id} - ${taskData.title}`);

    try {
      // Запускаем Documentation Agent
      const result = await this.agent.run(
        taskData.id,
        `task_completion: ${taskData.id}`
      );

      if (result.success) {
        console.log(`✅ Documentation updated successfully for task ${taskData.id}`);
        console.log(`🔗 PR created: ${result.prUrl}`);

        // Создаем новую задачу в Task Master для review документации
        await this.createDocumentationReviewTask(taskData.id, result.prUrl);

      } else {
        console.error(`❌ Documentation update failed: ${result.error}`);
      }

    } catch (error) {
      console.error(`❌ Hook execution failed:`, error.message);
    }
  }

  /**
   * Создание задачи review документации
   */
  async createDocumentationReviewTask(originalTaskId, prUrl) {
    try {
      const { execSync } = require('child_process');

      const prompt = `Review and merge documentation updates for completed task ${originalTaskId}

**PR URL:** ${prUrl}

**Description:**
Auto-generated documentation has been updated following task completion. Please:

1. Review the generated documentation for accuracy
2. Verify all code examples are current and correct
3. Check that architecture diagrams reflect actual implementation
4. Ensure no sensitive information is exposed
5. Merge the PR if everything looks good

**Acceptance Criteria:**
- [ ] Documentation accurately reflects current codebase
- [ ] No sensitive data or credentials exposed
- [ ] Code examples compile and work
- [ ] Architecture diagrams are up to date
- [ ] PR merged successfully`;

      // Создаем задачу через Task Master CLI
      const taskMasterCmd = `cd "${this.projectRoot}" && npx task-master-ai add-task --prompt="${prompt.replace(/"/g, '\\"')}"`;

      execSync(taskMasterCmd, { stdio: 'inherit' });
      console.log(`📋 Created documentation review task for ${originalTaskId}`);

    } catch (error) {
      console.error(`⚠️ Failed to create review task:`, error.message);
    }
  }

  /**
   * Polling для отслеживания завершенных задач
   */
  async startPolling(intervalMs = 30000) {
    console.log(`🔄 Starting task completion polling (${intervalMs}ms interval)...`);

    let lastCheckedTasks = new Set();

    setInterval(async () => {
      try {
        const { execSync } = require('child_process');

        // Получаем все завершенные задачи
        const tasksOutput = execSync(`cd "${this.projectRoot}" && npx task-master-ai get-tasks --status=done`, {
          encoding: 'utf8'
        });

        const tasksData = JSON.parse(tasksOutput);
        const completedTasks = tasksData.data.tasks || [];

        // Проверяем новые завершенные задачи
        for (const task of completedTasks) {
          if (!lastCheckedTasks.has(task.id)) {
            await this.onTaskCompleted(task);
            lastCheckedTasks.add(task.id);
          }
        }

      } catch (error) {
        console.error(`⚠️ Polling error:`, error.message);
      }
    }, intervalMs);
  }

  /**
   * Webhook endpoint для интеграции с Task Master
   */
  createWebhookServer(port = 3001) {
    const http = require('http');
    const url = require('url');

    const server = http.createServer(async (req, res) => {
      const parsedUrl = url.parse(req.url, true);

      if (req.method === 'POST' && parsedUrl.pathname === '/task-completed') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const taskData = JSON.parse(body);
            await this.onTaskCompleted(taskData);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));

          } catch (error) {
            console.error('Webhook error:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
          }
        });

      } else if (req.method === 'GET' && parsedUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          agent: 'COMETA Documentation Agent',
          timestamp: new Date().toISOString()
        }));

      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(port, () => {
      console.log(`🌐 Documentation Agent webhook server running on http://localhost:${port}`);
      console.log(`📋 POST http://localhost:${port}/task-completed - Task completion webhook`);
      console.log(`💚 GET http://localhost:${port}/health - Health check`);
    });

    return server;
  }
}

// CLI интерфейс
if (require.main === module) {
  const projectRoot = process.argv[2] || process.cwd();
  const mode = process.argv[3] || 'polling';
  const hook = new TaskCompletionHook(projectRoot);

  console.log(`🤖 COMETA Task Completion Hook starting...`);
  console.log(`📁 Project: ${projectRoot}`);
  console.log(`⚙️ Mode: ${mode}`);

  if (mode === 'webhook') {
    const port = parseInt(process.argv[4]) || 3001;
    hook.createWebhookServer(port);
  } else if (mode === 'polling') {
    const interval = parseInt(process.argv[4]) || 30000;
    hook.startPolling(interval);
  } else if (mode === 'once') {
    // Однократный запуск для тестирования
    const taskId = process.argv[4] || '1';
    const mockTask = {
      id: taskId,
      title: 'Test Task',
      status: 'done'
    };
    hook.onTaskCompleted(mockTask).then(() => {
      console.log('✅ Test completed');
      process.exit(0);
    });
  } else {
    console.log(`Usage: node task-completion-hook.js [projectRoot] [mode] [options]

Modes:
  polling [interval_ms]  - Poll for completed tasks (default: 30000ms)
  webhook [port]         - Start webhook server (default: port 3001)
  once [task_id]         - Run once for testing (default: task_id 1)

Examples:
  node task-completion-hook.js /path/to/project polling 10000
  node task-completion-hook.js /path/to/project webhook 3001
  node task-completion-hook.js /path/to/project once 1.2`);
    process.exit(1);
  }
}

module.exports = TaskCompletionHook;