-- Create material_transactions table for tracking material stock movements
CREATE TABLE IF NOT EXISTS public.material_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('receive', 'issue', 'adjust', 'transfer')),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) DEFAULT 0,
    reference_type VARCHAR(50), -- 'material_order', 'work_entry', 'adjustment', etc.
    reference_id UUID, -- ID of the related record (order, work entry, etc.)
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to materials table
ALTER TABLE public.material_transactions
ADD CONSTRAINT fk_material_transactions_material_id
FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_material_transactions_material_id
ON public.material_transactions(material_id);

CREATE INDEX IF NOT EXISTS idx_material_transactions_created_at
ON public.material_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_material_transactions_reference
ON public.material_transactions(reference_type, reference_id);

-- Add RLS policies for material_transactions
ALTER TABLE public.material_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for reading material transactions (all authenticated users)
CREATE POLICY "Allow read access to material_transactions"
ON public.material_transactions FOR SELECT
TO authenticated
USING (true);

-- Policy for inserting material transactions (all authenticated users)
CREATE POLICY "Allow insert access to material_transactions"
ON public.material_transactions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for updating material transactions (all authenticated users)
CREATE POLICY "Allow update access to material_transactions"
ON public.material_transactions FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for deleting material transactions (all authenticated users)
CREATE POLICY "Allow delete access to material_transactions"
ON public.material_transactions FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT ALL ON public.material_transactions TO authenticated;
GRANT ALL ON public.material_transactions TO service_role;

-- Optional: Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_material_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER trigger_update_material_transactions_updated_at
    BEFORE UPDATE ON public.material_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_material_transactions_updated_at();

-- Optionally, let's also add the current_stock column to materials table if it doesn't exist
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.materials ADD COLUMN current_stock DECIMAL(10,2) DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, do nothing
            NULL;
    END;
END $$;

-- Update any existing materials to have default stock of 0 if they don't have a value
UPDATE public.materials SET current_stock = 0 WHERE current_stock IS NULL;

-- Add comment for documentation
COMMENT ON TABLE public.material_transactions IS 'Tracks all material stock movements including receives, issues, adjustments, and transfers';
COMMENT ON COLUMN public.material_transactions.transaction_type IS 'Type of transaction: receive, issue, adjust, transfer';
COMMENT ON COLUMN public.material_transactions.reference_type IS 'Type of related record: material_order, work_entry, adjustment, etc.';
COMMENT ON COLUMN public.material_transactions.reference_id IS 'ID of the related record that caused this transaction';

-- Display confirmation
SELECT 'material_transactions table created successfully with all constraints, indexes, and RLS policies' AS status;