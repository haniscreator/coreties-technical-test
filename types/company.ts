/**
 * TODO: Define your Company interface here.
 *
 * Your SQL query in transformShipmentsToCompanies() should return data
 * matching this interface.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Company {
  name: string;
  country: string;
  website: string;
  totalShipments: number;
  totalWeight: number;
  role: 'Importer' | 'Exporter' | 'Both';
}
