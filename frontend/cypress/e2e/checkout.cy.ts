describe('Client Checkout Flow', () => {
    beforeEach(() => {
        cy.visit('/login');
        cy.get('input[name="email"]').type('client@smartshop.com');
        cy.get('input[name="password"]').type('client123');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/client/profile');
    });

    it('should add items to cart and place order', () => {
        cy.visit('/products');

        cy.contains('Add to Cart').first().click(); 

        cy.contains('Cart').click();
        cy.contains('Shopping Cart');
        cy.contains('Proceed to Checkout').click();
        cy.url().should('include', '/client/checkout');
        cy.contains('Order Summary');

        cy.contains('Cash').click();
        cy.contains('Place Order').click();

        cy.url().should('include', '/client/profile');
    });
});
