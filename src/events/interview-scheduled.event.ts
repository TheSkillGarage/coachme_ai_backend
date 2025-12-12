export class InterviewScheduledEvent {
  constructor(
    public readonly userId: string,
    public readonly applicationId: string,
    public readonly company: string,
    public readonly title: string,
    public readonly interviewDate: Date,
    public readonly location: string,
    public readonly interviewType: string,
  ) {}
}
