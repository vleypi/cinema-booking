export interface ICustomerProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  emailVerifiedAt: string | null;
}

export interface IUpdateCustomerProfilePayload {
  name?: string;
  phone?: string;
}

export interface ICustomerOrderTicket {
  id: string;
  code: string;
  price: number;
  status: string;
  row: number;
  number: number;
  seatType: string;
  qrPayload: string | null;
}

export interface ICustomerOrder {
  id: string;
  number: string;
  channel: string;
  status: string;
  totalAmount: number;
  holdExpiresAt: string | null;
  createdAt: string;
  cinema: {
    id: string;
    name: string;
    address: string;
    timezone: string;
  };
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    format: string;
    filmId: string;
    filmTitle: string;
    posterFileId: string | null;
    hallName: string;
  };
  tickets: ICustomerOrderTicket[];
}

export interface ICustomerOrdersList {
  upcoming: ICustomerOrder[];
  past: ICustomerOrder[];
}
