package com.example.orderservice.service;

import com.example.orderservice.model.Product;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.util.*;

@Service
public class ProductService {

    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbTable<Product> productTable;

    public ProductService(DynamoDbClient dynamoDbClient) {
        this.enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();

        this.productTable = enhancedClient.table("Products", TableSchema.fromBean(Product.class));
    }

    public Product createProduct(Product product) {
        product.setProductId(UUID.randomUUID().toString());
        product.setCreatedAt(java.time.Instant.now().toString());
        productTable.putItem(product);
        return product;
    }

    public List<Product> getAllProducts() {
        List<Product> products = new ArrayList<>();
        productTable.scan().items().forEach(products::add);
        return products;
    }

    public Optional<Product> getProductById(String id) {
        return Optional.ofNullable(productTable.getItem(r -> r.key(k -> k.partitionValue(id))));
    }
}
