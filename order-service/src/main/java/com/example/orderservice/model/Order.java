package com.example.orderservice.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import java.util.List;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbConvertedBy;
import com.example.orderservice.util.ProductItemListConverter;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

@DynamoDbBean
public class Order {

    private String orderID;
    private String customerName;
    private Double amount;
    private String invoiceUrl;
    private String orderDate;
    private List<ProductItem> items;

    @DynamoDbPartitionKey
    public String getOrderID() {
        return orderID;
    }

    public void setOrderID(String orderID) {
        this.orderID = orderID;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getInvoiceUrl() {
        return invoiceUrl;
    }

    public void setInvoiceUrl(String invoiceUrl) {
        this.invoiceUrl = invoiceUrl;
    }

    public String getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(String orderDate) {
        this.orderDate = orderDate;
    }

    @DynamoDbConvertedBy(ProductItemListConverter.class)
    public List<ProductItem> getItems() {
        return items;
    }

    public void setItems(List<ProductItem> items) {
        this.items = items;
    }

    public static TableSchema<Order> getTableSchema() {
    return TableSchema.fromBean(Order.class);
}
}
