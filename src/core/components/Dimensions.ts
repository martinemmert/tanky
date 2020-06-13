class Dimensions {
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  reset(): void {
    this.width = 0;
    this.height = 0;
  }
}

export default Dimensions;
