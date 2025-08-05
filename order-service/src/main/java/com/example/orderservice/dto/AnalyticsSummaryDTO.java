package com.example.orderservice.dto;

public class AnalyticsSummaryDTO {
    private int totalOrders;
    private int totalProducts;
    private int ordersToday;

    public AnalyticsSummaryDTO() {
    }

    public AnalyticsSummaryDTO(int totalOrders, int totalProducts, int ordersToday) {
        this.totalOrders = totalOrders;
        this.totalProducts = totalProducts;
        this.ordersToday = ordersToday;
    }

    public int getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }

    public int getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(int totalProducts) {
        this.totalProducts = totalProducts;
    }

    public int getOrdersToday() {
        return ordersToday;
    }

    public void setOrdersToday(int ordersToday) {
        this.ordersToday = ordersToday;
    }
}
