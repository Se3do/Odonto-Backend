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

export class UserStatsDto {
  totalAttempts!: number;
  averageScore!: number | null;
  bestScore!: number | null;
  totalXp!: number;
  currentStreak!: number;
  longestStreak!: number;
  lastCompletedDate!: Date | null;
}

export class AdminUserListItemDto {
  id!: string;
  username!: string;
  email!: string;
  role!: string;
  xpTotal!: number;
  currentStreak!: number;
  longestStreak!: number;
}

export class AdminUserListDto {
  items!: AdminUserListItemDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
  search!: string;
}
