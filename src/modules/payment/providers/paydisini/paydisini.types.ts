export interface ICreateTransactionResponse {
  success: boolean;
  msg: string;
  data?:
    | PaydisniQRISResponse
    | PaydisniVirtualAccountResponse
    | PaydisniEwalletResponse
    | PaydisniRetailResponse;
}

export interface PaydisniQRISResponse {
  unique_code: string;
  service: string;
  service_name: string;
  amount: string;
  balance: string;
  fee: string;
  type_fee: string;
  note: string;
  status: string;
  expired: string;
  qr_content: string;
  qrcode_url: string;
  checkout_url: string;
  created_at: string;
}

export interface PaydisniVirtualAccountResponse {
  unique_code: string;
  service: string;
  service_name: string;
  amount: string;
  balance: string;
  fee: string;
  type_fee: string;
  note: string;
  status: string;
  expired: string;
  virtual_account: string;
  checkout_url: string;
  created_at: string;
}

export interface PaydisniEwalletResponse {
  unique_code: string;
  service: string;
  service_name: string;
  amount: string;
  balance: string;
  fee: string;
  type_fee: string;
  note: string;
  status: string;
  expired: string;
  checkout_url: string;
  created_at: string;
}

export interface PaydisniRetailResponse {
  unique_code: string;
  service: string;
  service_name: string;
  amount: string;
  balance: string;
  fee: string;
  type_fee: string;
  note: string;
  status: string;
  expired: string;
  payment_code: string;
  checkout_url: string;
  created_at: string;
}

export interface ICancelTransactionResponse {
  success: boolean;
  msg: string;
  data?: CancelData;
}
interface CancelData {
  unique_code: string;
  status: string;
  amount: string;
  balance: string;
  fee: string;
  note: string;
  created_at: string;
}

export interface PaydisiniViewChannelResponse {
  success: boolean;
  msg: string;
  data?: Datum[];
}
interface Datum {
  id: string;
  name: string;
  type: string;
  minimum: string;
  maximum: string;
  fee: number | string;
  settlement: string;
  img: string;
  status: string;
}
