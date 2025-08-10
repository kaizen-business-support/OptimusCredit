import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface OcrOptions {
  language?: string;
  pages?: number[];
  dpi?: number;
}

interface ExtractedFinancialData {
  bilan?: {
    [key: string]: number;
  };
  compteResultat?: {
    [key: string]: number;
  };
  tableauFluxTresorerie?: {
    [key: string]: number;
  };
  confidence?: number;
}

export class OcrService {
  private worker: any = null;

  async initializeOcr(): Promise<void> {
    if (!this.worker) {
      this.worker = await createWorker('fra');
      await this.worker.setParameters({
        tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
        tessedit_ocr_engine_mode: '1', // Neural nets LSTM engine only
      });
    }
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  async extractTextFromPdf(file: File, options: OcrOptions = {}): Promise<string[]> {
    const { pages = [], language = 'fra' } = options;
    
    try {
      await this.initializeOcr();
      
      // Convert PDF to images - scan all pages if none specified
      const pdfImages = await this.convertPdfToImages(file, pages);
      
      // Extract text from each page
      const extractedTexts: string[] = [];
      
      for (let i = 0; i < pdfImages.length; i++) {
        console.log(`Processing page ${i + 1}/${pdfImages.length}...`);
        
        const { data: { text, confidence } } = await this.worker.recognize(pdfImages[i]);
        
        console.log(`Page ${i + 1} confidence: ${confidence}%`);
        console.log(`Page ${i + 1} text sample:`, text.substring(0, 200) + '...');
        extractedTexts.push(text);
      }
      
      return extractedTexts;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async convertPdfToImages(file: File, targetPages: number[] = []): Promise<HTMLCanvasElement[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: HTMLCanvasElement[] = [];
    
    const totalPages = pdf.numPages;
    const pagesToProcess = targetPages.length > 0 ? targetPages : Array.from({ length: totalPages }, (_, i) => i + 1);
    
    for (const pageNum of pagesToProcess) {
      if (pageNum > totalPages) continue;
      
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext).promise;
      images.push(canvas);
    }
    
    return images;
  }

  async extractFinancialData(file: File, options: OcrOptions = {}): Promise<ExtractedFinancialData> {
    try {
      console.log('Starting financial data extraction...');
      
      // Extract text from all pages (don't specify pages to scan all)
      const extractedTexts = await this.extractTextFromPdf(file, { ...options, pages: [] });
      
      // Combine all texts for analysis
      const combinedText = extractedTexts.join('\n\n--- PAGE BREAK ---\n\n');
      
      console.log('Extracted text length:', combinedText.length);
      console.log('Full extracted text:', combinedText);
      
      // Parse financial data from extracted text
      const financialData = this.parseFinancialData(combinedText);
      
      return financialData;
    } catch (error) {
      console.error('Error extracting financial data:', error);
      throw error;
    }
  }

  private parseFinancialData(text: string): ExtractedFinancialData {
    const result: ExtractedFinancialData = {};
    
    // Note: Year is provided by user, no need to extract from OCR text
    
    // Define patterns for OHADA financial statements - capture full numbers but stop at next line/word
    const financialPatterns = {
      // BILAN ACTIF - Key summary fields
      total_actif_immobilise: [
        /total\s+actif\s+immobilis[eé][\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi,
        /actif\s+immobilis[eé][\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi
      ],
      total_actif_circulant: [
        /total\s+actif\s+circulant[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi,
        /actif\s+circulant[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi
      ],
      tresorerie_actif: [
        /total\s+tr[eé]sorerie\s+actif[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi,
        /tr[eé]sorerie\s+actif[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi
      ],
      total_actif: [
        /total\s+g[eé]n[eé]ral[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi,
        /total\s+actif[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi
      ],

      // BILAN PASSIF - Key summary fields
      capitaux_propres: [
        /total\s+capitaux\s+propres[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi,
        /capitaux\s+propres[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi
      ],
      dettes_financieres: [
        /total\s+dettes\s+financi[eè]res[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi,
        /dettes\s+financi[eè]res[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi
      ],
      total_dettes: [
        /passif\s+circulant[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi,
        /total\s+passif\s+circulant[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi
      ],

      // COMPTE DE RESULTAT - Key fields
      chiffre_affaires: [
        /chiffre\s+d[\'']affaires[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi,
        /ventes[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi
      ],
      total_produits_exploitation: [
        /total\s+produits\s+d[\'']exploitation[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi,
        /produits\s+d[\'']exploitation[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi
      ],
      total_charges_exploitation: [
        /total\s+charges\s+d[\'']exploitation[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi,
        /charges\s+d[\'']exploitation[\s\n]+([0-9\s.,]+?)(?=\n[A-Za-z]|$)/gi
      ],
      resultat_exploitation: [
        /r[eé]sultat\s+d[\'']exploitation[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi,
        /r[eé]sultat\s+op[eé]rationnel[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi
      ],
      resultat_financier: [
        /r[eé]sultat\s+financier[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi
      ],
      resultat_courant: [
        /r[eé]sultat\s+courant[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi
      ],
      resultat_net: [
        /r[eé]sultat\s+net[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi,
        /b[eé]n[eé]fice\s+net[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi
      ],

      // TABLEAU DE FLUX DE TRESORERIE - Key fields
      tresorerie_debut_periode: [
        /tr[eé]sorerie.*?d[eé]but[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi,
        /tr[eé]sorerie.*?initiale[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi
      ],
      flux_tresorerie_activites_operationnelles: [
        /flux.*?op[eé]rationnelles[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi,
        /activit[eé]s.*?op[eé]rationnelles[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi
      ],
      flux_tresorerie_activites_investissement: [
        /flux.*?investissement[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi,
        /activit[eé]s.*?investissement[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi
      ],
      flux_tresorerie_activites_financement: [
        /flux.*?financement[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi,
        /activit[eé]s.*?financement[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi
      ],
      variation_tresorerie: [
        /variation.*?tr[eé]sorerie[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi
      ],
      tresorerie_fin_periode: [
        /tr[eé]sorerie.*?fin[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi,
        /tr[eé]sorerie.*?finale[\s\n]+([0-9\s.,\-]+?)(?=\n[A-Za-z]|$)/gi
      ]
    };

    // Extract all financial data using unified patterns
    const extractedData = this.extractDataFromPatterns(text, financialPatterns);

    // Calculate confidence score based on how many fields were extracted
    const totalFields = Object.keys(financialPatterns).length;
    const extractedFields = Object.keys(extractedData).length;
    
    result.confidence = Math.round((extractedFields / totalFields) * 100);

    console.log('OCR Extraction results:', {
      totalPossibleFields: totalFields,
      extractedFields: extractedFields,
      confidence: result.confidence,
      extractedFieldNames: Object.keys(extractedData)
    });

    // Store extracted data directly (no nested structure)
    result.bilan = extractedData;
    result.compteResultat = extractedData; 
    result.tableauFluxTresorerie = extractedData;

    return result;
  }

  private extractDataFromPatterns(text: string, patterns: Record<string, RegExp[]>): Record<string, number> {
    const result: Record<string, number> = {};
    
    console.log(`\n=== Pattern matching for ${Object.keys(patterns).length} fields ===`);
    
    for (const [fieldName, fieldPatterns] of Object.entries(patterns)) {
      let value: number | null = null;
      let bestMatch = null;
      
      console.log(`\nLooking for field: ${fieldName}`);
      
      for (let i = 0; i < fieldPatterns.length; i++) {
        const pattern = fieldPatterns[i];
        const matches = Array.from(text.matchAll(pattern));
        
        console.log(`  Pattern ${i + 1}/${fieldPatterns.length}: found ${matches.length} matches`);
        
        if (matches.length > 0) {
          for (const match of matches) {
            let numberStr = match[1];
            
            // Limit the captured string to first 50 characters to avoid OCR artifacts
            if (numberStr.length > 50) {
              numberStr = numberStr.substring(0, 50);
            }
            
            // Clean up the captured text but be less restrictive
            // Just remove leading/trailing whitespace and limit total length
            numberStr = numberStr.trim();
            if (numberStr.length > 30) {
              // If too long, try to extract first reasonable number part
              const firstNumberMatch = numberStr.match(/^([0-9\s.,\-]+?)(?=\s[A-Za-z]|$)/);
              if (firstNumberMatch) {
                numberStr = firstNumberMatch[1];
              } else {
                numberStr = numberStr.substring(0, 30);
              }
            }
            
            // More robust number cleaning
            let cleanedNumber = numberStr
              .replace(/\s+/g, '') // Remove all spaces
              .replace(/[^\d.,\-]/g, ''); // Keep only digits, commas, dots, minus
            
            // Handle different number formats
            if (cleanedNumber.includes(',') && cleanedNumber.includes('.')) {
              // Format like: 1,234.56 or 1.234,56
              if (cleanedNumber.lastIndexOf(',') > cleanedNumber.lastIndexOf('.')) {
                // European format: 1.234,56
                cleanedNumber = cleanedNumber.replace(/\./g, '').replace(',', '.');
              } else {
                // US format: 1,234.56
                cleanedNumber = cleanedNumber.replace(/,/g, '');
              }
            } else if (cleanedNumber.includes(',')) {
              // Could be decimal comma (European) or thousands separator
              const parts = cleanedNumber.split(',');
              if (parts.length === 2 && parts[1].length <= 3) {
                // Likely decimal comma: 123,45
                cleanedNumber = cleanedNumber.replace(',', '.');
              } else {
                // Likely thousands separator: 1,234,567
                cleanedNumber = cleanedNumber.replace(/,/g, '');
              }
            }
            
            const parsedNumber = parseFloat(cleanedNumber);
            
            // Validate number is realistic for financial data (not too large, not garbage)
            const isValidFinancialNumber = (num: number): boolean => {
              if (isNaN(num)) return false;
              if (num === 0) return false;
              
              // More relaxed limits - allow up to 100 trillion (very large companies)
              if (Math.abs(num) > 100000000000000) return false;
              
              // Allow more digits but still reject obvious OCR artifacts
              const numStr = Math.abs(num).toString();
              if (numStr.length > 15) return false;
              
              return true;
            };
            
            if (isValidFinancialNumber(parsedNumber)) {
              value = parsedNumber;
              bestMatch = { original: numberStr, cleaned: cleanedNumber, parsed: parsedNumber };
              console.log(`    ✓ Valid match: "${numberStr}" -> ${parsedNumber}`);
              break;
            } else {
              console.log(`    ✗ Invalid/unrealistic match: "${numberStr}" -> ${cleanedNumber} -> ${parsedNumber} (too large or invalid)`);
            }
          }
          
          if (value !== null) break; // Stop at first successful pattern
        }
      }
      
      if (value !== null && bestMatch) {
        result[fieldName] = value;
        console.log(`  ✅ ${fieldName}: ${value} (from "${bestMatch.original}")`);
      } else {
        console.log(`  ❌ ${fieldName}: no valid value found`);
      }
    }
    
    console.log(`\n=== Pattern matching complete: ${Object.keys(result).length} fields extracted ===`);
    return result;
  }

  // Convert extracted OCR data to OptimusCredit format
  convertToOptimusFormat(ocrData: ExtractedFinancialData): any {
    const result: any = {};
    
    // Simply return the extracted financial data - no ratio calculations
    // The FinancialCalculator will handle ratios later in the workflow
    if (ocrData.bilan) {
      Object.assign(result, ocrData.bilan);
    }
    
    console.log('OCR -> OptimusCredit conversion:', {
      inputFields: Object.keys(ocrData.bilan || {}),
      outputFields: Object.keys(result),
      sampleValues: Object.entries(result).slice(0, 5)
    });
    
    return result;
  }
}

export const ocrService = new OcrService();