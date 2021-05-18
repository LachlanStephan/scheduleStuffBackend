-- phpMyAdmin SQL Dump
-- version 4.9.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: May 17, 2021 at 10:48 AM
-- Server version: 5.7.26
-- PHP Version: 7.4.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `scheduleStuff`
--

-- --------------------------------------------------------

--
-- Table structure for table `Categories`
--

CREATE TABLE `Categories` (
  `category_ID` int(11) NOT NULL,
  `birthday` date NOT NULL,
  `personal` varchar(255) NOT NULL,
  `work` varchar(255) NOT NULL,
  `study` varchar(255) NOT NULL,
  `social` varchar(255) NOT NULL,
  `eventID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `friends`
--

CREATE TABLE `friends` (
  `user1_ID` int(11) NOT NULL,
  `user2_ID` int(11) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Schedule`
--

CREATE TABLE `Schedule` (
  `event_ID` int(11) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `eventName` varchar(255) NOT NULL,
  `eventDescription` longtext NOT NULL,
  `eventRepeat` tinyint(1) DEFAULT NULL,
  `eventRepeatEnd` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `userEvent`
--

CREATE TABLE `userEvent` (
  `userEvent_ID` int(10) UNSIGNED NOT NULL,
  `users_ID` int(11) DEFAULT NULL,
  `event_ID` int(11) NOT NULL,
  `sharedFlag` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `users_ID` int(10) NOT NULL,
  `fName` varchar(255) NOT NULL,
  `lName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `userType` varchar(11) NOT NULL DEFAULT 'user',
  `created_at_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Categories`
--
ALTER TABLE `Categories`
  ADD PRIMARY KEY (`category_ID`),
  ADD KEY `Fk_eventID` (`eventID`);

--
-- Indexes for table `friends`
--
ALTER TABLE `friends`
  ADD KEY `user1_FK` (`user1_ID`),
  ADD KEY `user2_FK` (`user2_ID`);

--
-- Indexes for table `Schedule`
--
ALTER TABLE `Schedule`
  ADD PRIMARY KEY (`event_ID`);

--
-- Indexes for table `userEvent`
--
ALTER TABLE `userEvent`
  ADD PRIMARY KEY (`userEvent_ID`),
  ADD KEY `usersID` (`users_ID`),
  ADD KEY `eventID` (`event_ID`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`users_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Categories`
--
ALTER TABLE `Categories`
  MODIFY `category_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Schedule`
--
ALTER TABLE `Schedule`
  MODIFY `event_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `userEvent`
--
ALTER TABLE `userEvent`
  MODIFY `userEvent_ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `users_ID` int(10) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Categories`
--
ALTER TABLE `Categories`
  ADD CONSTRAINT `Fk_eventID` FOREIGN KEY (`eventID`) REFERENCES `Schedule` (`event_ID`);

--
-- Constraints for table `friends`
--
ALTER TABLE `friends`
  ADD CONSTRAINT `user1_FK` FOREIGN KEY (`user1_ID`) REFERENCES `Users` (`users_ID`),
  ADD CONSTRAINT `user2_FK` FOREIGN KEY (`user2_ID`) REFERENCES `Users` (`users_ID`);

--
-- Constraints for table `userEvent`
--
ALTER TABLE `userEvent`
  ADD CONSTRAINT `eventID` FOREIGN KEY (`event_ID`) REFERENCES `Schedule` (`event_ID`),
  ADD CONSTRAINT `usersID` FOREIGN KEY (`users_ID`) REFERENCES `Users` (`users_ID`);
