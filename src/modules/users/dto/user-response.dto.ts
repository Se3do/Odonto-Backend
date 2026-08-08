export class UserResponseDto {
  id!: string;

  username!: string;

  email!: string;

  role!: string;

  xpTotal!: number;

  currentStreak!: number;

  longestStreak!: number;
}

export class LeaderboardEntryDto {
  rank!: number;
  id!: string;
  username!: string;
  xpTotal!: number;
  currentStreak!: number;
  longestStreak!: number;
}
