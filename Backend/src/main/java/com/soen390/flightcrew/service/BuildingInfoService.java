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
        if (building.getBuildingCode() == null || building.getBuildingCode().isEmpty()) {
            return null;
        }

        String url = BASE_URL + building.getBuildingCode().toUpperCase() + ".html";
        try {
            // Use RestTemplate to fetch the HTML content so we can mock it in tests
            String html = restTemplate.getForObject(url, String.class);
            if (html == null)
                return null;

            Document doc = Jsoup.parse(html);

            // Look for "Building accessibility" heading
            Element accessibilityHeader = doc
                    .selectFirst("h2:contains(Building accessibility), h3:contains(Building accessibility)");

            if (accessibilityHeader != null) {
                StringBuilder info = new StringBuilder();

                // Check direct siblings of the header (header and content are siblings)
                Element next = accessibilityHeader.nextElementSibling();
                boolean checkedSiblings = false;
                while (next != null) {
                    checkedSiblings = true;
                    if (isHeader(next))
                        break;
                    processElement(next, info);
                    next = next.nextElementSibling();
                }

                // If no info found from siblings, header might be in a wrapper.
                // Check parent's siblings (AEM usage often wraps components in divs).
                if (info.length() == 0 && accessibilityHeader.parent() != null) {
                    Element parent = accessibilityHeader.parent();

                    // Example structure:
                    // <div class="parsys">
                    // <div class="c-title"><h2>Building accessibility</h2></div>
                    // <div class="reference">...content...</div>
                    // </div>

                    while (parent != null && parent.nextElementSibling() == null && !parent.tagName().equals("body")) {
                        parent = parent.parent();
                    }

                    if (parent != null) {
                        Element parentNext = parent.nextElementSibling();
                        while (parentNext != null) {
                            // If we see a header, it's likely the next section
                            if (isHeader(parentNext))
                                break;
                            // Or if the div contains a header for the next section
                            if (!parentNext.select("h2, h3").isEmpty()) {
                                // Double check it's not a subsection header relevant to accessibility
                                break;
                            }

                            processElement(parentNext, info);
                            parentNext = parentNext.nextElementSibling();
                        }
                    }
                }

                if (info.length() > 0) {
                    return info.toString().trim();
                }

                // Fallback
                Element content = accessibilityHeader.nextElementSibling();
                if (content != null) {
                    return content.text();
                }

            } else {
                logger.warning("Accessibility section not found for building: " + building.getBuildingCode());
            }

        } catch (Exception e) {
            logger.severe("Error searching for building info at " + url + ": " + e.getMessage());
        }

        return "N/A";
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
