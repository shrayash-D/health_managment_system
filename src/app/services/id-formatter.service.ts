import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdFormatterService {
  /**
   * Formats a GUID to a short, readable format
   * @param id The full GUID (e.g., "a0af83ba-2c2f-40cf-bdc9-08de6ba470ad")
   * @param prefix Optional prefix for the ID (e.g., "DOC", "PAT", "APT", "INV")
   * @param length Number of characters to take from the ID (default: 8)
   * @returns Formatted short ID (e.g., "DOC-A0AF83BA")
   */
  formatShortId(
    id: string | number,
    prefix: string = '',
    length: number = 8,
  ): string {
    if (!id) return 'N/A';

    const idString = String(id);

    // If it's already a number or short string, return as-is
    if (idString.length <= 10 && !idString.includes('-')) {
      return prefix ? `${prefix}-${idString}` : idString;
    }

    // Extract first 'length' characters from GUID, removing hyphens
    const shortId = idString
      .replace(/-/g, '')
      .substring(0, length)
      .toUpperCase();

    return prefix ? `${prefix}-${shortId}` : shortId;
  }

  /**
   * Format Doctor ID
   */
  formatDoctorId(id: string | number): string {
    return this.formatShortId(id, 'DOC', 8);
  }

  /**
   * Format Patient ID
   */
  formatPatientId(id: string | number): string {
    return this.formatShortId(id, 'PAT', 8);
  }

  /**
   * Format Appointment ID
   */
  formatAppointmentId(id: string | number): string {
    return this.formatShortId(id, 'APT', 8);
  }

  /**
   * Format Invoice ID
   */
  formatInvoiceId(id: string | number): string {
    return this.formatShortId(id, 'INV', 8);
  }

  /**
   * Get just the short ID without prefix
   */
  getShortId(id: string | number, length: number = 8): string {
    return this.formatShortId(id, '', length);
  }
}
