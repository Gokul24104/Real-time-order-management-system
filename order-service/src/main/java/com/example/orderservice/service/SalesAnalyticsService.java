package com.example.orderservice.service;

import com.example.orderservice.model.Order;
import com.example.orderservice.model.ProductAnalytics;
import com.example.orderservice.model.ProductItem;

import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;

import java.util.*;

@Service
public class SalesAnalyticsService {

    private final DynamoDbEnhancedClient enhancedClient;

    public SalesAnalyticsService(DynamoDbEnhancedClient enhancedClient) {
        this.enhancedClient = enhancedClient;
    }

    public List<ProductAnalytics> getSalesByProduct() {
        DynamoDbTable<Order> orderTable = enhancedClient.table("Orders", Order.getTableSchema());

        Map<String, ProductAnalytics> map = new HashMap<>();

        orderTable.scan().items().forEach(order -> {
            for (ProductItem item : order.getItems()) {
                map.putIfAbsent(item.getProductId(), new ProductAnalytics(item.getProductId(), 0, 0));
                ProductAnalytics entry = map.get(item.getProductId());
                entry.setQuantity(entry.getQuantity() + item.getQuantity());
                entry.setRevenue(entry.getRevenue() + (item.getQuantity() * item.getUnitPrice()));
            }
        });

        return new ArrayList<>(map.values());
    }
}
