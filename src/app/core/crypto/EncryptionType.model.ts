export enum EncryptionType {
  METADATA, // Store groupe key in the document metadata and share with new members
  KEY_AGREEMENT_BD, // A new group key is generated at each join/leave members. Key never transits between members.
  NONE, // No encyption group key
}
