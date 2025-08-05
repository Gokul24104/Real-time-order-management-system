package com.example.orderservice.repository;

import com.example.orderservice.model.Order;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.util.ArrayList;
import java.util.List;

@Repository
public class OrderRepository {

    private final DynamoDbTable<Order> orderTable;

    public OrderRepository(DynamoDbClient dynamoDbClient) {
        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
        this.orderTable = enhancedClient.table("orders", TableSchema.fromBean(Order.class));
    }

    public void saveOrder(Order order) {

        orderTable.putItem(order);
    }

    public Order getOrder(String orderId) {
        Order order = orderTable.getItem(r -> r.key(k -> k.partitionValue(orderId)));
        try {
            System.out.println("Repository returned: " + new ObjectMapper().writeValueAsString(order));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return order;
    }

    public List<Order> listOrders() {
        List<Order> orders = new ArrayList<>();
        orderTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .forEach(orders::add);
        return orders;
    }
}
