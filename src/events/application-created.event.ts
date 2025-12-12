export class ApplicationCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly applicationId: string,
    public readonly company: string,
    public readonly position: string,
    public readonly location: string,
  ) {}
}
