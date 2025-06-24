export const FILE_LIMITS = {
    MAX_PDF_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_EXCEL_SIZE: 5 * 1024 * 1024 // 5MB
  };
  
  export const REPORT_TEMPLATES = {
    SALES_REPORT_TITLE: (start: Date, end: Date) => 
      `Sales Report (${start.toDateString()} - ${end.toDateString()})`
  };