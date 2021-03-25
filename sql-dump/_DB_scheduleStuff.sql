-- phpMyAdmin SQL Dump
-- version 4.9.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Mar 25, 2021 at 02:33 AM
-- Server version: 5.7.26
-- PHP Version: 7.4.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `scheduleStuff`
--

-- --------------------------------------------------------

--
-- Table structure for table `Categories`
--
-- Creation: Mar 16, 2021 at 06:29 AM
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
-- Table structure for table `Schedule`
--
-- Creation: Mar 16, 2021 at 06:40 AM
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
-- Creation: Mar 18, 2021 at 10:26 AM
--

CREATE TABLE `userEvent` (
  `userEvent_ID` int(10) UNSIGNED NOT NULL,
  `users_ID` int(11) NOT NULL,
  `event_ID` int(11) NOT NULL,
  `sharedFlag` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--
-- Creation: Mar 25, 2021 at 01:04 AM
-- Last update: Mar 25, 2021 at 01:06 AM
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
-- Indexes for table `Categories`
--
ALTER TABLE `Categories`
  ADD PRIMARY KEY (`category_ID`),
  ADD KEY `Fk_eventID` (`eventID`);

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
-- AUTO_INCREMENT for table `Categories`
--
ALTER TABLE `Categories`
  MODIFY `category_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Schedule`
--
ALTER TABLE `Schedule`
  MODIFY `event_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `userEvent`
--
ALTER TABLE `userEvent`
  MODIFY `userEvent_ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `users_ID` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- Constraints for table `Categories`
--
ALTER TABLE `Categories`
  ADD CONSTRAINT `Fk_eventID` FOREIGN KEY (`eventID`) REFERENCES `Schedule` (`event_ID`);

--
-- Constraints for table `userEvent`
--
ALTER TABLE `userEvent`
  ADD CONSTRAINT `eventID` FOREIGN KEY (`event_ID`) REFERENCES `Schedule` (`event_ID`),
  ADD CONSTRAINT `usersID` FOREIGN KEY (`users_ID`) REFERENCES `Users` (`users_ID`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
