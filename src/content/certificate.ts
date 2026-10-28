/**
 * The certificate is shown as the original Russian scan. Each zone below sits over one
 * block of text (positions in % of the image) and reveals its English translation on hover.
 * The translation is mine, unofficial; the original stays visible underneath.
 */
export type CertificateZone = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  english: string;
  /** Description of a picture rather than a translation of text. */
  isDescription?: boolean;
  /** The oversized spaced-out word at the top. */
  isTitle?: boolean;
};

export const CERTIFICATE_IMAGE = "certificate";

export const CERTIFICATE_ZONES: CertificateZone[] = [
  { id: "school", left: 30, top: 1.6, width: 38, height: 4.6, english: "OHD School of Digital Design" },
  { id: "number", left: 81, top: 1.6, width: 16, height: 4.6, english: "Certificate No. 153" },
  { id: "title", left: 1, top: 15.5, width: 98, height: 7, english: "Certificate", isTitle: true },
  {
    id: "license",
    left: 33,
    top: 23.6,
    width: 34,
    height: 5,
    english: "Educational activity license No. L035-01268-47/03617558",
  },
  {
    id: "arms",
    left: 40,
    top: 29.8,
    width: 20,
    height: 14.6,
    english: "State coat of arms of the Russian Federation",
    isDescription: true,
  },
  { id: "certify", left: 27, top: 47, width: 45, height: 2.4, english: "This is to certify that" },
  { id: "name", left: 27, top: 49.2, width: 46, height: 2.8, english: "Anastasia Dmitrievna Vilmovskaya" },
  {
    id: "body",
    left: 19,
    top: 54.2,
    width: 62,
    height: 9.6,
    english:
      "has passed the final assessment and demonstrated a high level of proficiency in the programme “Fundamentals of Web Design and Digital Branding” (227.5 academic hours)",
  },
  {
    id: "author",
    left: 32,
    top: 70.6,
    width: 34,
    height: 4.8,
    english: "Programme author: Marianna Dmitrievna Lebedeva, sole proprietor",
  },
  { id: "signature-left", left: 8, top: 93.8, width: 22, height: 3.2, english: "M. D. Lebedeva" },
  { id: "signature-right", left: 66, top: 93.8, width: 26, height: 3.2, english: "R. A. Lapchik" },
];
