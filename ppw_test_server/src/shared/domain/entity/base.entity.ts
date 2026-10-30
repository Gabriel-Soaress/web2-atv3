export type DefaulTimeStampsProps = {
  createdAt?: Date;
  updateAt?: Date | null;
  deleteAt?: Date | null;
};

export abstract class BaseEntity<Props extends DefaulTimeStampsProps> {
  public readonly props: Props;

  constructor(props: Props) {
    this.props = props;
  }
}
