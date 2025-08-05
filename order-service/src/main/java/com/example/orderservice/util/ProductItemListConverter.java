package com.example.orderservice.util;

import com.example.orderservice.model.ProductItem;
import software.amazon.awssdk.enhanced.dynamodb.AttributeConverter;
import software.amazon.awssdk.enhanced.dynamodb.AttributeValueType;
import software.amazon.awssdk.enhanced.dynamodb.EnhancedType;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

public class ProductItemListConverter implements AttributeConverter<List<ProductItem>> {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public AttributeValue transformFrom(List<ProductItem> input) {
        try {
            return AttributeValue.fromS(mapper.writeValueAsString(input));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize items", e);
        }
    }

    @Override
    public List<ProductItem> transformTo(AttributeValue input) {
        try {
            return mapper.readValue(input.s(), new TypeReference<List<ProductItem>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize items", e);
        }
    }

    @Override
    public AttributeValueType attributeValueType() {
        return AttributeValueType.S;
    }

    @Override
    public EnhancedType<List<ProductItem>> type() {
        return EnhancedType.listOf(ProductItem.class);
    }
}
