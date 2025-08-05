package com.example.orderservice.controller;

import com.example.orderservice.dto.AnalyticsSummaryDTO;
import com.example.orderservice.dto.DailyOrdersDTO;
import com.example.orderservice.model.Order;
import com.example.orderservice.model.ProductAnalytics;
import com.example.orderservice.service.SalesAnalyticsService;

import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private final SalesAnalyticsService analyticsService;
    private final DynamoDbEnhancedClient enhancedClient;

    public AnalyticsController(SalesAnalyticsService analyticsService, DynamoDbEnhancedClient enhancedClient) {
        this.analyticsService = analyticsService;
        this.enhancedClient = enhancedClient;
    }

    @GetMapping("/products")
    public List<ProductAnalytics> getProductSales() {
        return analyticsService.getSalesByProduct();
    }

    @GetMapping("/orders-by-day")
    public List<DailyOrdersDTO> getOrdersByDay() {
        DynamoDbTable<Order> orderTable = enhancedClient.table("orders", Order.getTableSchema());
        
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        List<DailyOrdersDTO> result = new ArrayList<>();
        
        // Create map to count orders by day
        Map<LocalDate, Integer> orderCountByDate = new HashMap<>();
        
        // Initialize last 7 days with 0 orders
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            orderCountByDate.put(date, 0);
        }
        
        // Count actual orders from DynamoDB
        for (Order order : orderTable.scan().items()) {
            if (order.getOrderDate() != null) {
                try {
                    LocalDate orderLocalDate = LocalDate.parse(order.getOrderDate().substring(0, 10));
                    
                    // Only count if it's within our 7-day range
                    if (orderCountByDate.containsKey(orderLocalDate)) {
                        orderCountByDate.put(orderLocalDate, orderCountByDate.get(orderLocalDate) + 1);
                    }
                } catch (Exception e) {
                    System.err.println("Invalid orderDate: " + order.getOrderDate());
                }
            }
        }
        
        // Convert to DTO format with day names
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("EEE");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dayName = date.format(dayFormatter);
            int orderCount = orderCountByDate.get(date);
            result.add(new DailyOrdersDTO(dayName, orderCount));
        }
        
        return result;
    }

    @GetMapping("/summary")
    public AnalyticsSummaryDTO getSummary() {
        DynamoDbTable<Order> orderTable = enhancedClient.table("orders", Order.getTableSchema());

        int totalOrders = 0;
        int ordersToday = 0;
        Set<String> uniqueProductIds = new HashSet<>();

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));

        for (Order order : orderTable.scan().items()) {
            totalOrders++;

            // ✅ Use orderDate string to compare dates
            if (order.getOrderDate() != null) {
                try {
                    LocalDate orderLocalDate = LocalDate.parse(order.getOrderDate().substring(0, 10)); // yyyy-MM-dd
                    if (orderLocalDate.equals(today)) {
                        ordersToday++;
                    }
                } catch (Exception e) {
                    // handle malformed date
                    System.err.println("Invalid orderDate: " + order.getOrderDate());
                }
            }

            if (order.getItems() != null) {
                order.getItems().forEach(item -> uniqueProductIds.add(item.getProductId()));
            }
        }

        return new AnalyticsSummaryDTO(totalOrders, uniqueProductIds.size(), ordersToday);
    }
}