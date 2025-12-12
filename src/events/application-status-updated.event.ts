export class ApplicationStatusUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly applicationId: string,
    public readonly company: string,
    public readonly position: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
  ) {}
}
