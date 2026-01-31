import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ProductForm from './ProductForm';

describe('ProductForm', () => {
    const mockSubmit = vi.fn();
    const mockCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form fields', () => {
        render(<ProductForm onSubmit={mockSubmit} onCancel={mockCancel} />);

        expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Stock/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/SKU/i)).toBeInTheDocument();
    });

    it.skip('validates required fields', async () => {
        const user = userEvent.setup();
        render(<ProductForm onSubmit={mockSubmit} onCancel={mockCancel} />);

        await user.click(screen.getByRole('button', { name: /Create Product/i }));

        await waitFor(() => {
            expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
        });

        expect(mockSubmit).not.toHaveBeenCalled();
    });

    it.skip('submits valid data', async () => {
        const user = userEvent.setup();
        render(<ProductForm onSubmit={mockSubmit} onCancel={mockCancel} />);

        await user.type(screen.getByLabelText(/Product Name/i), 'Test Product');
        await user.type(screen.getByLabelText(/Description/i), 'Test Description');
        await user.type(screen.getByLabelText(/Price/i), '100');
        await user.type(screen.getByLabelText(/Stock/i), '50');
        await user.type(screen.getByLabelText(/SKU/i), 'PROD-001');

        await user.click(screen.getByRole('button', { name: /Create Product/i }));

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Test Product',
                description: 'Test Description',
                price: 100,
                stockQuantity: 50,
                sku: 'PROD-001'
            }));
        });
    });

    it('pre-fills data when editing', () => {
        const initialData = {
            id: 1,
            name: 'Existing Product',
            description: 'Existing Desc',
            price: 50,
            stockQuantity: 10,
            sku: 'EXIST-001',
            isActive: true,
            isDeleted: false
        };

        render(<ProductForm onSubmit={mockSubmit} onCancel={mockCancel} initialData={initialData} />);

        expect(screen.getByDisplayValue('Existing Product')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Existing Desc')).toBeInTheDocument();
        expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    });
});
