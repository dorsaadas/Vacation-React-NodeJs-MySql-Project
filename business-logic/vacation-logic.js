const dal = require("../data-access-layer/dal");

// all users

// only login in users can access this function
async function getAllVacations() {
  const sql = `SELECT vacations.vacationId , vacations.description,vacations.destination ,vacations.imageName , vacations.startingDate , vacations.endingDate , vacations.price , count(BelovedVacation.userId)as following 
  from vacations left Join BelovedVacation 
  on BelovedVacation.vacationId = vacations.vacationId GROUP BY vacationId
  order By following DESC `;
  const vacations = await dal.executeAsync(sql);
  return vacations;
}

async function newFollower(vacation) {
  const sql = `INSERT INTO BelovedVacation(userId,VacationId) VALUES(${vacation.userId},${vacation.vacationId})`;
  const changedFollower = await dal.executeAsync(sql);
  return changedFollower;
}
async function removedFollower(vacation) {
  const sql = `DELETE FROM BelovedVacation WHERE vacationId = ${vacation.vacationId} AND userId = ${vacation.userId}`;
  const changedFollower = await dal.executeAsync(sql);
  return changedFollower;
}

async function getFollowersForVacation() {
  const sql = `SELECT userId, vacationId from BelovedVacation WHERE vacationId = vacationId `;
  const changedFollower = await dal.executeAsync(sql);
  return changedFollower;
}

// Only access for admin
async function addVacation(vacation) {
  const sql = `INSERT INTO vacations(description,destination,startingDate,endingDate,imageName,price)
    VALUES('${vacation.description}','${vacation.destination}','${vacation.startingDate}','${vacation.endingDate}','${vacation.imageName}',${vacation.price})`;
  const newVacation = await dal.executeAsync(sql);
  return newVacation;
}

async function deleteVacation(vacationId) {
  const sql = `DELETE from vacations where vacations.vacationId = ${vacationId}`;
  await dal.executeAsync(sql);
  return;
}

async function updateVacation(vacation) {
  let sql = "UPDATE vacations SET ";

  if (vacation.description !== undefined) {
    sql += `vacations.description = '${vacation.description}',`;
  }

  if (vacation.destination !== undefined) {
    sql += `vacations.destination = '${vacation.destination}' ,`;
  }

  if (vacation.startingDate !== undefined) {
    sql += `vacations.startingDate = '${vacation.startingDate}',`;
  }
  if (vacation.endingDate !== undefined) {
    sql += ` vacations.endingDate = '${vacation.endingDate}',`;
  }
  if (vacation.imageName !== undefined) {
    sql += `vacations.imageName = '${vacation.imageName}',`;
  }
  if (vacation.price !== undefined) {
    sql += `vacations.price = ${vacation.price},`;
  }

  sql = sql.substr(0, sql.length - 1); //Remove last comma

  sql += ` WHERE vacationId = ${vacation.vacationId}`;

  const info = await dal.executeAsync(sql);

  if (info.affectedRows) {
    // if there are affected rows - product has been found to be updated.
    return vacation;
  }

  return null; // no affected rows. no such product.
}

module.exports = {
  getAllVacations,
  addVacation,
  updateVacation,
  getFollowersForVacation,
  deleteVacation,
  newFollower,
  removedFollower,
};
