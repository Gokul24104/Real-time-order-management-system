package com.example.orderservice.dto;

public class DailyOrdersDTO {
    private String date;
    private int orders;

    public DailyOrdersDTO() {
    }

    public DailyOrdersDTO(String date, int orders) {
        this.date = date;
        this.orders = orders;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public int getOrders() {
        return orders;
    }

    public void setOrders(int orders) {
        this.orders = orders;
    }
}