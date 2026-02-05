describe('Login Flow', () => {
    it('should allow admin to login and redirect to dashboard', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type('admin@smartshop.com');
        cy.get('input[name="password"]').type('admin123');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/admin/dashboard');
        cy.contains('Admin Dashboard');
    });

    it('should allow client to login and redirect to profile', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type('client@smartshop.com');
        cy.get('input[name="password"]').type('client123');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/client/profile');
        cy.contains('My Dashboard');
    });

    it('should show error on invalid credentials', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type('wrong@smartshop.com');
        cy.get('input[name="password"]').type('wrong');
        cy.get('button[type="submit"]').click();

        cy.contains('Invalid credentials');
});
