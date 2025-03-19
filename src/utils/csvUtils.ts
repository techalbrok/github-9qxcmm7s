/**
 * Parse CSV data into an array of objects
 * @param csvText The CSV text to parse
 * @param headers Optional array of headers to use instead of the first row
 * @returns Array of objects where keys are headers and values are row values
 */
export function parseCSV<T>(csvText: string, headers?: string[]): T[] {
  // Split the text into rows
  const rows = csvText.split("\n").filter((row) => row.trim() !== "");

  if (rows.length === 0) {
    return [];
  }

  // Use provided headers or extract from first row
  const csvHeaders =
    headers || rows[0].split(",").map((header) => header.trim());
  const dataRows = headers ? rows : rows.slice(1);

  return dataRows.map((row) => {
    const values = row.split(",").map((value) => value.trim());
    const rowData: Record<string, any> = {};

    csvHeaders.forEach((header, index) => {
      if (index < values.length) {
        rowData[header] = values[index];
      } else {
        rowData[header] = "";
      }
    });

    return rowData as T;
  });
}

/**
 * Validate CSV data against expected fields
 * @param data Parsed CSV data
 * @param requiredFields Array of field names that must be present
 * @returns Object with validation result and any errors
 */
export function validateCSVData<T>(
  data: T[],
  requiredFields: string[],
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.length === 0) {
    errors.push("El archivo CSV no contiene datos");
    return { isValid: false, errors };
  }

  // Check if all required fields are present in the first row
  const firstRow = data[0];
  const missingFields = requiredFields.filter((field) => !(field in firstRow));

  if (missingFields.length > 0) {
    errors.push(`Faltan campos requeridos: ${missingFields.join(", ")}`);
  }

  // Check for empty required values in each row
  data.forEach((row, index) => {
    requiredFields.forEach((field) => {
      if (
        field in row &&
        (!row[field as keyof T] || row[field as keyof T] === "")
      ) {
        errors.push(`Fila ${index + 1}: El campo '${field}' está vacío`);
      }
    });
  });

  return { isValid: errors.length === 0, errors };
}
