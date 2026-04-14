package com.cinebook.ticket.service;

import com.cinebook.ticket.dto.TicketRequest;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    public byte[] generateTicket(TicketRequest request) throws DocumentException, IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);

        document.open();

        // Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, Font.BOLD, new Color(229, 9, 20));
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Font.BOLD, Color.WHITE);
        Font mainFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Font.NORMAL, Color.LIGHT_GRAY);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD, Color.WHITE);
        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Font.ITALIC, Color.GRAY);

        // Ticket Container (Pseudo-dark mode)
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(17, 17, 17)); // Dark background
        cell.setPadding(40);
        cell.setBorderWidth(2);
        cell.setBorderColor(new Color(40, 40, 40));

        // 1. Logo/Title
        Paragraph logo = new Paragraph("CINEBOOK", titleFont);
        logo.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(logo);
        cell.addElement(new Paragraph(" ", mainFont)); // Spacer

        // 2. Movie Title
        Paragraph movie = new Paragraph(request.getMovieTitle().toUpperCase(), headerFont);
        movie.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(movie);
        cell.addElement(new Paragraph(" ", mainFont));

        // 3. Info Grid
        PdfPTable infoGrid = new PdfPTable(2);
        infoGrid.setWidthPercentage(100);
        
        addInfoCell(infoGrid, "THEATRE", request.getTheatre(), boldFont, mainFont);
        addInfoCell(infoGrid, "DATE", request.getDate(), boldFont, mainFont);
        addInfoCell(infoGrid, "SHOWTIME", request.getTime(), boldFont, mainFont);
        addInfoCell(infoGrid, "SEATS", String.join(", ", request.getSeats()), boldFont, mainFont);
        
        cell.addElement(infoGrid);
        cell.addElement(new Paragraph(" ", mainFont));

        // 4. QR Code
        byte[] qrCodeBytes = generateQRCode(request.getBookingId());
        Image qrCodeImage = Image.getInstance(qrCodeBytes);
        qrCodeImage.setAlignment(Element.ALIGN_CENTER);
        qrCodeImage.scaleAbsolute(100, 100);
        cell.addElement(qrCodeImage);

        Paragraph bookingId = new Paragraph("BOOKING ID: " + request.getBookingId(), boldFont);
        bookingId.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(bookingId);
        cell.addElement(new Paragraph(" ", mainFont));

        // 5. Food Items
        if (request.getFoodItems() != null && !request.getFoodItems().isEmpty()) {
            Paragraph foodHeader = new Paragraph("FOOD & SNACKS", boldFont);
            cell.addElement(foodHeader);
            cell.addElement(new Paragraph("----------------------------------------------------------------", mainFont));
            
            for (TicketRequest.FoodItem item : request.getFoodItems()) {
                Paragraph p = new Paragraph(item.getName() + " x" + item.getQuantity() + " - Rs." + (item.getPrice() * item.getQuantity()), mainFont);
                cell.addElement(p);
            }
            cell.addElement(new Paragraph(" ", mainFont));
        }

        // 6. Total Amount
        Paragraph total = new Paragraph("TOTAL PAID: Rs." + request.getTotalAmount(), titleFont);
        total.setAlignment(Element.ALIGN_RIGHT);
        cell.addElement(total);
        cell.addElement(new Paragraph(" ", mainFont));

        // 7. Footer
        cell.addElement(new Paragraph("----------------------------------------------------------------", mainFont));
        Paragraph footer = new Paragraph("Show this ticket at the theatre entrance. Enjoy your movie!", footerFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(footer);
        
        Paragraph timestamp = new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), footerFont);
        timestamp.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(timestamp);

        table.addCell(cell);
        document.add(table);
        document.close();

        return out.toByteArray();
    }

    private void addInfoCell(PdfPTable table, String label, String value, Font bold, Font light) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(10);
        cell.addElement(new Paragraph(label, light));
        cell.addElement(new Paragraph(value, bold));
        table.addCell(cell);
    }

    private byte[] generateQRCode(String text) throws IOException {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 200, 200);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            return pngOutputStream.toByteArray();
        } catch (Exception e) {
            throw new IOException("Could not generate QR code", e);
        }
    }
}
