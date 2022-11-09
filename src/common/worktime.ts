export class WorkTime {
  private workingUsers: string[] = [];

  constructor() {}

  startUser(userId: string) {
    console.log(`startUser(${userId})`);
  }

  endUser(userId: string) {
    console.log(`endUser(${userId})`);
  }
}
