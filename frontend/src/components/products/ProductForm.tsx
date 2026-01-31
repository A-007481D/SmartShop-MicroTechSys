import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { Product } from '../../api/productApi';

const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().min(0, 'Price must be non-negative'),
    stockQuantity: z.number().min(0, 'Stock must be non-negative'),
    sku: z.string().min(1, 'SKU is required'),
    imageUrl: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    initialData?: Product;
    onSubmit: (data: ProductFormData) => Promise<void>;
    isLoading?: boolean;
    onCancel: () => void;
}

export default function ProductForm({ initialData, onSubmit, isLoading, onCancel }: ProductFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            description: initialData.description,
            price: initialData.price,
            stockQuantity: initialData.stockQuantity,
            sku: initialData.sku,
            imageUrl: initialData.imageUrl
        } : undefined
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Product Name"
                error={errors.name?.message}
                {...register('name')}
            />

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    id="description"
                    {...register('description')}
                    rows={3}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Price ($)"
                    type="number"
                    step="0.01"
                    error={errors.price?.message}
                    {...register('price', { valueAsNumber: true })}
                />
                <Input
                    label="Stock Quantity"
                    type="number"
                    error={errors.stockQuantity?.message}
                    {...register('stockQuantity', { valueAsNumber: true })}
                />
            </div>

            <Input
                label="SKU"
                error={errors.sku?.message}
                {...register('sku')}
            />

            <Input
                label="Image URL (Optional)"
                error={errors.imageUrl?.message}
                {...register('imageUrl')}
            />

            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel} className="w-auto">
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading} className="w-auto">
                    {initialData ? 'Update Product' : 'Create Product'}
                </Button>
            </div>
        </form>
    );
}
