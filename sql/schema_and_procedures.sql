-- Schema and stored procedures for ScoreCard API
-- Run this on your SQL Server database (e.g. tempdb or your app DB)

-- Tables
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
CREATE TABLE Users (
  UserId INT IDENTITY(1,1) PRIMARY KEY,
  Phone NVARCHAR(15) NOT NULL UNIQUE,
  Name NVARCHAR(100) NOT NULL,
  DOB DATE NOT NULL,
  Email NVARCHAR(255) NOT NULL,
  CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Scores')
CREATE TABLE Scores (
  ScoreId INT IDENTITY(1,1) PRIMARY KEY,
  UserId INT NOT NULL REFERENCES Users(UserId),
  Score INT NOT NULL,
  CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

GO

-- Check if phone exists (for Register API - phone unique)
IF OBJECT_ID('sp_CheckPhoneExists', 'P') IS NOT NULL DROP PROCEDURE sp_CheckPhoneExists;
GO
CREATE PROCEDURE sp_CheckPhoneExists
  @Phone NVARCHAR(15)
AS
  SELECT CAST(CASE WHEN EXISTS (SELECT 1 FROM Users WHERE Phone = @Phone) THEN 1 ELSE 0 END AS BIT) AS Exists,
         (SELECT COUNT(*) FROM Users WHERE Phone = @Phone) AS [Count];
GO

-- Register user (for Register API)
IF OBJECT_ID('sp_RegisterUser', 'P') IS NOT NULL DROP PROCEDURE sp_RegisterUser;
GO
CREATE PROCEDURE sp_RegisterUser
  @Phone NVARCHAR(15),
  @Name NVARCHAR(100),
  @DOB DATE,
  @Email NVARCHAR(255)
AS
  INSERT INTO Users (Phone, Name, DOB, Email) VALUES (@Phone, @Name, @DOB, @Email);
  SELECT SCOPE_IDENTITY() AS UserId;
GO

-- Save score (for Save Score API)
IF OBJECT_ID('sp_SaveScore', 'P') IS NOT NULL DROP PROCEDURE sp_SaveScore;
GO
CREATE PROCEDURE sp_SaveScore
  @UserId INT,
  @Score INT
AS
  INSERT INTO Scores (UserId, Score) VALUES (@UserId, @Score);
GO

-- Today's score count per user (for max 3 per day validation)
IF OBJECT_ID('sp_GetTodayScoreCount', 'P') IS NOT NULL DROP PROCEDURE sp_GetTodayScoreCount;
GO
CREATE PROCEDURE sp_GetTodayScoreCount
  @UserId INT
AS
  SELECT COUNT(*) AS [Count] FROM Scores
  WHERE UserId = @UserId AND CAST(CreatedAt AS DATE) = CAST(GETUTCDATE() AS DATE);
GO

-- User rank, total score, name (for Get Score Card API)
IF OBJECT_ID('sp_GetUserScoreCardInfo', 'P') IS NOT NULL DROP PROCEDURE sp_GetUserScoreCardInfo;
GO
CREATE PROCEDURE sp_GetUserScoreCardInfo
  @UserId INT
AS
  ;WITH Totals AS (
    SELECT UserId, SUM(Score) AS Total FROM Scores GROUP BY UserId
  ),
  MyTotal AS (
    SELECT ISNULL(Total, 0) AS Total FROM Totals WHERE UserId = @UserId
  )
  SELECT u.Name AS UserName, u.Name,
         ISNULL((SELECT SUM(Score) FROM Scores WHERE UserId = @UserId), 0) AS TotalScore,
         (SELECT 1 + COUNT(*) FROM Totals t, MyTotal m WHERE t.Total > m.Total) AS [Rank]
  FROM Users u WHERE u.UserId = @UserId;
GO
