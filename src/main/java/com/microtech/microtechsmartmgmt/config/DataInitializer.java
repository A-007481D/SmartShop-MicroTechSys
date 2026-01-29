package com.microtech.microtechsmartmgmt.config;

import com.microtech.microtechsmartmgmt.entity.User;
import com.microtech.microtechsmartmgmt.enums.UserRole;
import com.microtech.microtechsmartmgmt.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initializes default admin user on application startup
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements org.springframework.boot.CommandLineRunner {

    private final UserRepository userRepository;
    private final com.microtech.microtechsmartmgmt.repository.ClientRepository clientRepository;
    private final com.microtech.microtechsmartmgmt.repository.ProductRepository productRepository;
    private final com.microtech.microtechsmartmgmt.repository.OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() <= 1) { // Only admin potentially exists
            createDefaultAdminIfNotExists();
            seedClients();
            seedProducts();
            seedOrders();
        }
    }

    private void createDefaultAdminIfNotExists() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .name("System Administrator")
                    .role(UserRole.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Default admin created");
        }
    }

    private void seedClients() {
        createClient("tech_solutions", "Tech Solutions SARL", "contact@techsolutions.ma",
                com.microtech.microtechsmartmgmt.enums.CustomerTier.GOLD);
        createClient("info_services", "Info Services", "info@infoservices.ma",
                com.microtech.microtechsmartmgmt.enums.CustomerTier.SILVER);
        createClient("dev_house", "Dev House", "dev@devhouse.ma",
                com.microtech.microtechsmartmgmt.enums.CustomerTier.PLATINUM);
        createClient("start_inc", "Start Inc", "hello@startinc.ma",
                com.microtech.microtechsmartmgmt.enums.CustomerTier.BASIC);
        log.info("Clients seeded");
    }

    private void createClient(String username, String fullName, String email,
            com.microtech.microtechsmartmgmt.enums.CustomerTier tier) {
        com.microtech.microtechsmartmgmt.entity.Client client = com.microtech.microtechsmartmgmt.entity.Client.builder()
                .username(username)
                .password(passwordEncoder.encode("pass123"))
                .name(fullName)
                .fullName(fullName)
                .email(email)
                .role(UserRole.CLIENT)
                .tier(tier)
                .totalOrders(0)
                .turnover(java.math.BigDecimal.ZERO)
                .build();
        clientRepository.save(client);
    }

    private void seedProducts() {
        createProduct("Laptop HP EliteBook", "Intel i7, 16GB RAM, 512GB SSD", new java.math.BigDecimal("12500.00"), 10,
                "Laptops");
        createProduct("Dell XPS 15", "Intel i9, 32GB RAM, 1TB SSD", new java.math.BigDecimal("24000.00"), 5, "Laptops");
        createProduct("Logitech MX Master 3", "Wireless Mouse", new java.math.BigDecimal("1100.00"), 50, "Accessories");
        createProduct("Samsung 27 inch Monitor", "4K UHD, IPS", new java.math.BigDecimal("4500.00"), 15, "Peripherals");
        createProduct("Mechanical Keyboard", "Cherry MX Red", new java.math.BigDecimal("1800.00"), 20, "Accessories");
        log.info("Products seeded");
    }

    private void createProduct(String name, String desc, java.math.BigDecimal price, int stock, String category) {
        com.microtech.microtechsmartmgmt.entity.Product product = com.microtech.microtechsmartmgmt.entity.Product
                .builder()
                .name(name)
                .description(desc)
                .price(price)
                .stockQuantity(stock)
                .category(category)
                .active(true)
                .build();
        productRepository.save(product);
    }

    private void seedOrders() {
        java.util.List<com.microtech.microtechsmartmgmt.entity.Client> clients = clientRepository.findAll();
        java.util.List<com.microtech.microtechsmartmgmt.entity.Product> products = productRepository.findAll();

        if (clients.isEmpty() || products.isEmpty())
            return;

        createOrder(clients.get(0), products.subList(0, 2),
                com.microtech.microtechsmartmgmt.enums.OrderStatus.COMPLETED);
        createOrder(clients.get(1), products.subList(2, 3),
                com.microtech.microtechsmartmgmt.enums.OrderStatus.CONFIRMED);
        createOrder(clients.get(2), products.subList(0, 1), com.microtech.microtechsmartmgmt.enums.OrderStatus.PENDING);
        createOrder(clients.get(0), products.subList(3, 4),
                com.microtech.microtechsmartmgmt.enums.OrderStatus.DELIVERED);
        createOrder(clients.get(3), products.subList(1, 2),
                com.microtech.microtechsmartmgmt.enums.OrderStatus.COMPLETED);

        log.info("Orders seeded");
    }

    private void createOrder(com.microtech.microtechsmartmgmt.entity.Client client,
            java.util.List<com.microtech.microtechsmartmgmt.entity.Product> products,
            com.microtech.microtechsmartmgmt.enums.OrderStatus status) {
        com.microtech.microtechsmartmgmt.entity.Order order = new com.microtech.microtechsmartmgmt.entity.Order();
        order.setClient(client);
        order.setStatus(status);
        order.setOrderDate(java.time.LocalDateTime.now().minusDays((long) (Math.random() * 30)));

        java.math.BigDecimal total = java.math.BigDecimal.ZERO;
        java.util.List<com.microtech.microtechsmartmgmt.entity.OrderItem> items = new java.util.ArrayList<>();

        for (com.microtech.microtechsmartmgmt.entity.Product p : products) {
            com.microtech.microtechsmartmgmt.entity.OrderItem item = com.microtech.microtechsmartmgmt.entity.OrderItem
                    .builder()
                    .order(order)
                    .product(p)
                    .quantity(1)
                    .unitPrice(p.getPrice())
                    .build();
            items.add(item);
            total = total.add(p.getPrice());
        }

        order.setItems(items);
        order.setTotalAmount(total);
        orderRepository.save(order);
    }
}
