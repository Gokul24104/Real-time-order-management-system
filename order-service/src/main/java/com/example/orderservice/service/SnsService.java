package com.example.orderservice.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import com.example.orderservice.model.Order;

@Service
public class SnsService {

    private final SnsClient snsClient;
    private final String topicArn = "arn:aws:sns:ap-south-1:227457566081:order-notifications"; // Replace with actual ARN

    public SnsService(SnsClient snsClient) {
        this.snsClient = snsClient;
    }

    @Async
    public void publishOrderNotification(Order order) {
        String message = String.format("New order created: %s for ₹%.2f",
                order.getCustomerName(), order.getAmount());

        PublishRequest request = PublishRequest.builder()
                .message(message)
                .subject("New Order Created")
                .topicArn(topicArn)
                .build();

        snsClient.publish(request);

        System.out.println("✅ SNS notification published for order: " + order.getOrderID());
    }
}
