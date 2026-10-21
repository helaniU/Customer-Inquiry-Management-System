import { render, screen, fireEvent } from '@testing-library/react';
import NewInquiryPage from './page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('Inquiry Capture UI Validation', () => {
    test('displays field validation errors when submitting blank inputs', async () => {
        render(<NewInquiryPage />);

        const submitBtn = screen.getByRole('button', { name: /Record Inquiry/i });

        // Trigger submit on empty form
        fireEvent.click(submitBtn);

        // Verify client HTML5 or explicit error states trigger on input elements
        const customerInput = screen.getByPlaceholderText(/Jane Doe/i) as HTMLInputElement;
        expect(customerInput.checkValidity()).toBe(false);
    });
});