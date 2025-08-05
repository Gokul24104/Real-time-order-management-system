package com.example.orderservice.model;

public class ProductAnalytics {
    private String productId;
    private int quantity;
    private double revenue;

    public ProductAnalytics(String productId, int quantity, double revenue) {
        this.productId = productId;
        this.quantity = quantity;
        this.revenue = revenue;
    }

    public String getProductId() {
        return productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public double getRevenue() {
        return revenue;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void setRevenue(double revenue) {
        this.revenue = revenue;
    }
}
