export interface LegacyImportProps {
  userId: string;
  onImported: () => Promise<void> | void;
}
