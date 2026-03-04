package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.Building;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.logging.Logger;

@Service
public class BuildingInfoService {

    private static final Logger logger = Logger.getLogger(BuildingInfoService.class.getName());
    private static final String BASE_URL = "https://www.concordia.ca/maps/buildings/";

    private final RestTemplate restTemplate;

    public BuildingInfoService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Scrapes the Concordia website for accessibility information for a specific
     * building.
     *
     * @param building The building object containing the code (e.g., "H").
     * @return The extracted accessibility information as a String, or null if not
     *         found.
     */
    public String fetchAccessibilityInfo(Building building) {
        if (building == null || building.getBuildingCode() == null || building.getBuildingCode().isEmpty()) {
            return null;
        }

        String url = BASE_URL + building.getBuildingCode().toUpperCase() + ".html";
        try {
            Document doc = fetchDocument(url);
            if (doc == null) {
                return null;
            }

            Element accessibilityHeader = findAccessibilityHeader(doc);
            if (accessibilityHeader == null) {
                logger.warning(
                        "Accessibility section not found for building: " + building.getBuildingCode());
                return "N/A";
            }

            String info = extractAccessibilityInfo(accessibilityHeader);
            if (!info.isEmpty()) {
                return info;
            }

            // Fallback: If no info was extracted (e.g. empty sections), try immediate next
            // sibling
            return extractFallbackContent(accessibilityHeader);

        } catch (Exception e) {
            logger.severe("Error searching for building info at " + url + ": " + e.getMessage());
        }

        return "N/A";
    }

    private Document fetchDocument(String url) {
        // Use RestTemplate to fetch the HTML content so we can mock it in tests
        String html = restTemplate.getForObject(url, String.class);
        return html != null ? Jsoup.parse(html) : null;
    }

    private Element findAccessibilityHeader(Document doc) {
        // Look for "Building accessibility" heading
        return doc.selectFirst(
                "h2:contains(Building accessibility), h3:contains(Building accessibility)");
    }

    private String extractAccessibilityInfo(Element header) {
        StringBuilder info = new StringBuilder();

        // 1. Try direct siblings of the header
        extractFromSiblings(header.nextElementSibling(), info);

        // 2. If no info found, try searching in parent container siblings (AEM
        // structure)
        if (info.length() == 0 && header.parent() != null) {
            Element container = findContainer(header);
            if (container != null) {
                extractFromParentSiblings(container.nextElementSibling(), info);
            }
        }

        return info.toString().trim();
    }

    private void extractFromSiblings(Element startElement, StringBuilder info) {
        Element next = startElement;
        while (next != null) {
            if (isHeader(next)) {
                break;
            }
            processElement(next, info);
            next = next.nextElementSibling();
        }
    }

    private Element findContainer(Element header) {
        Element parent = header.parent();
        while (parent != null && parent.nextElementSibling() == null && !parent.tagName().equals("body")) {
            parent = parent.parent();
        }
        return parent;
    }

    private void extractFromParentSiblings(Element startElement, StringBuilder info) {
        Element next = startElement;
        while (next != null) {
            // If we see a header, it's likely the next section
            if (isHeader(next)) {
                break;
            }
            if (!next.select("h2, h3").isEmpty()) {
                break;
            }

            processElement(next, info);
            next = next.nextElementSibling();
        }
    }

    private String extractFallbackContent(Element header) {
        Element content = header.nextElementSibling();
        return content != null ? content.text() : "N/A";
    }

    private boolean isHeader(Element element) {
        return element.tagName().matches("h[1-6]");
    }

    private void processElement(Element element, StringBuilder info) {
        // Check for AEM textimage component
        Element textImage = element.hasClass("c-textimage") ? element : element.selectFirst(".c-textimage");
        if (textImage != null) {
            Element bold = textImage.selectFirst("b");
            String text = textImage.text();
            if (bold != null) {
                String title = bold.text();
                String desc = text.replace(title, "").trim();
                info.append(title).append(": ").append(desc).append("\n");
            } else {
                info.append(text).append("\n");
            }
            return;
        }

        // Check for simple paragraphs
        if (element.tagName().equals("p") || element.tagName().equals("div")) {
            String text = element.text().trim();
            if (!text.isEmpty()) {
                info.append(text).append("\n");
            }
        }
    }
}
