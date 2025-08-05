package com.example.orderservice.controller;

import com.example.orderservice.model.Order;
import com.example.orderservice.model.ProductItem;
import com.example.orderservice.repository.OrderRepository;
import com.example.orderservice.service.S3Service;
import com.example.orderservice.service.SnsService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final S3Service s3Service;
    private final SnsService snsService;

    public OrderController(OrderRepository orderRepository, S3Service s3Service, SnsService snsService) {
        this.orderRepository = orderRepository;
        this.s3Service = s3Service;
        this.snsService = snsService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createOrder(
            @RequestParam String customerName,
            @RequestParam Double amount,
            @RequestParam("items") String itemsJson,
            @RequestPart("invoice") MultipartFile invoiceFile) {

        try {
            // Parse product items from JSON
            ObjectMapper mapper = new ObjectMapper();
            List<ProductItem> items = mapper.readValue(itemsJson, new TypeReference<List<ProductItem>>() {});

            // Build Order
            String orderId = UUID.randomUUID().toString();
            Order order = new Order();
            order.setOrderID(orderId);
            order.setCustomerName(customerName);
            order.setAmount(amount);
            order.setItems(items);
            order.setOrderDate(Instant.now().toString());

            // Upload invoice to S3
            String originalName = invoiceFile.getOriginalFilename();
            String safeName = (originalName != null && !originalName.isBlank()) ? originalName : "invoice.pdf";
            String sanitizedFilename = safeName.replaceAll("\\s+", "_");
            String invoiceKey = "invoices/" + orderId + "_" + sanitizedFilename;

            s3Service.uploadFile(invoiceKey, invoiceFile);
            order.setInvoiceUrl(invoiceKey);

            // Debug: confirm full order before save

            // Save and notify
            orderRepository.saveOrder(order);
            snsService.publishOrderNotification(order);

            return ResponseEntity.ok(orderId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PutMapping(value = "/{orderId}/invoice", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadInvoice(@PathVariable String orderId,
                                                @RequestParam MultipartFile file) throws IOException {
        Order existing = orderRepository.getOrder(orderId);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        String originalName = file.getOriginalFilename();
        String safeName = (originalName != null && !originalName.isBlank()) ? originalName : "invoice.pdf";
        String sanitizedFilename = safeName.replaceAll("\\s+", "_");

        String invoiceKey = "invoices/" + orderId + "_" + sanitizedFilename;

        s3Service.uploadFile(invoiceKey, file);
        existing.setInvoiceUrl(invoiceKey);
        orderRepository.saveOrder(existing);

        return ResponseEntity.ok("Invoice uploaded");
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.listOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        Order order = orderRepository.getOrder(id);

        // Debug: check what’s returned
        try {
            System.out.println("Fetched Order: " + new ObjectMapper().writeValueAsString(order));
        } catch (Exception e) {
            e.printStackTrace();
        }

        return order != null ? ResponseEntity.ok(order) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/invoice-url")
    public ResponseEntity<String> getInvoiceDownloadUrl(@PathVariable String id) {
        Order order = orderRepository.getOrder(id);
        if (order == null || order.getInvoiceUrl() == null) {
            return ResponseEntity.notFound().build();
        }

        String key = order.getInvoiceUrl();
        if (!key.startsWith("invoices/")) {
            return ResponseEntity.status(500).body("Invalid invoice key format");
        }

        String freshUrl = s3Service.generatePresignedUrl(key);
        return ResponseEntity.ok(freshUrl);
    }
}
