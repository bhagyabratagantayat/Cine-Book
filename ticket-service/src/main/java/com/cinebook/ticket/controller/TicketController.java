package com.cinebook.ticket.controller;

import com.cinebook.ticket.dto.TicketRequest;
import com.cinebook.ticket.service.PdfGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
public class TicketController {

    @Autowired
    private PdfGeneratorService pdfService;

    @PostMapping("/generate-ticket")
    public ResponseEntity<byte[]> generateTicket(@RequestBody TicketRequest request) {
        try {
            System.out.println("Generating ticket for: " + request.getBookingId());
            byte[] pdf = pdfService.generateTicket(request);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "ticket-" + request.getBookingId() + ".pdf");
            
            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
