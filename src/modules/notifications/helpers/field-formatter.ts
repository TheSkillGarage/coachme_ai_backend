export class FieldFormatter {
  static formatFieldList(fields: string[]): string {
    const readableFields = fields.map((field) =>
      this.convertCamelCaseToReadable(field),
    );

    if (readableFields.length === 1) {
      return readableFields[0];
    }

    if (readableFields.length === 2) {
      return `${readableFields[0]} and ${readableFields[1]}`;
    }

    const lastField = readableFields.pop();
    return `${readableFields.join(', ')}, and ${lastField}`;
  }

  static convertCamelCaseToReadable(text: string): string {
    return text
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
