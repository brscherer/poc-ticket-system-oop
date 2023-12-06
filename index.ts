class Ticket {
  concert: Concert;
  zone: Zone;

  constructor(concert: Concert, zone: Zone) {
    this.concert = concert;
    this.zone = zone;
  }
}

class Concert {
  date: Date;
  bandName: string;
  location: Location;

  constructor(date: Date, bandName: string, location: Location) {
    this.date = date;
    this.bandName = bandName;
    this.location = location;
  }
}

class Zone {
  name: string;
  price: number;
  capacity: number;

  constructor(name: string, price: number, capacity: number) {
    this.name = name;
    this.price = price;
    this.capacity = capacity;
  }

  clone(override: Pick<Zone, "name" | "price" | "capacity">): Zone {
    return new Zone(
      override.name ?? this.name,
      override.price ?? this.price,
      override.capacity ?? this.capacity
    );
  }
}

interface Location {
  name: string;
  zones: Zone[];
}

class Sbrubbles implements Location {
  private zone = new Zone("A", 200, 1)
  readonly name = "Sbrubbles";
  readonly zones = [
    this.zone,
    this.zone.clone({ name: "B", price: 100, capacity: 10 }),
    this.zone.clone({ name: "C", price: 50, capacity: 20 }),
  ];
}

class ConcertService {
  private static instance: ConcertService;
  private soldTickets: Ticket[];
  private concerts: Concert[];

  private constructor() {
    this.soldTickets = [];
    this.concerts = [];
  }

  private getZoneAvailability(zone: Zone): number {
    const zoneSoldTickets = this.soldTickets.filter(
      (ticket) => ticket.zone.name === zone.name
    ).length;
    return zone.capacity - zoneSoldTickets;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ConcertService();
    }
    return this.instance;
  }

  sellTicket(bandName: string, zoneName: string): boolean {
    const concert = this.concerts.find((c) => c.bandName == bandName);
    if (!concert) {
      console.log("Concert not found");
      return false;
    }
    const zone = concert.location.zones.find((z) => z.name === zoneName);
    if (!zone) {
      console.log("Zone not found");
      return false;
    }

    if (!this.getZoneAvailability(zone)) {
      console.log("Zone has sold out");
      return false;
    }

    const ticket = new Ticket(concert, zone);
    this.soldTickets.push(ticket);
    console.log(`Ticket sold for ${bandName} on zone ${zoneName}`);
    return true;
  }

  createEvent(date: Date, bandName: string, location: Location): boolean {
    const concert = new Concert(date, bandName, location);
    this.concerts.push(concert);
    console.log(`${bandName} registerd to play on ${date} at ${location.name}`);
    return true;
  }
}

class TicketSystem {
  private concertService: ConcertService;

  constructor(concertService: ConcertService) {
    this.concertService = concertService;
  }

  createEvent(date: Date, bandName: string, location: Location): boolean {
    return this.concertService.createEvent(date, bandName, location);
  }

  sellTicket(bandName: string, zoneName: string): boolean {
    return this.concertService.sellTicket(bandName, zoneName);
  }
}

const concertService = ConcertService.getInstance();
const system = new TicketSystem(concertService);

system.createEvent(new Date(), "The First", new Sbrubbles());

// should print error band not found
system.sellTicket("Second Thoughts", "Premium");

// should print error zone not found
system.sellTicket("The First", "Premium");

system.sellTicket("The First", "A");

// should print error because Zone sold out
system.sellTicket("The First", "A");

system.sellTicket("The First", "B");
