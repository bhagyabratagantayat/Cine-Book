package com.cinebook.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketRequest {
    private String bookingId;
    private String movieTitle;
    private String theatre;
    private String date;
    private String time;
    private List<String> seats;
    private List<FoodItem> foodItems;
    private double totalAmount;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FoodItem {
        private String name;
        private int quantity;
        private double price;
    }
}
