const mongoose = require('mongoose');
// this query builder returns a mongodb compatible query
class PatientQueryBuilder {

  constructor() {
    this.criteria = {};

    // Default sorting configuration
    this.sortBy = 'name';
    this.sortOrder = 'asc';
  }

  // Shared method for text-based criteria
  setText(field, value) {
    if (value === undefined || value === null || value === '') {
      delete this.criteria[field];
      return this;
    }

    if (typeof value !== 'string') {
      throw new TypeError(`${field} must be a string`);
    }

    const trimmedValue = value.trim();

    if (trimmedValue === '') {
      delete this.criteria[field];
    } else {
      this.criteria[field] = trimmedValue;
    }

    return this;
  }

  // Shared method for age-based criteria
  setAge(field, value) {
    if (value === undefined || value === null || value === '') {
      delete this.criteria[field];
      return this;
    }

    const age = Number(value);

    if (!Number.isInteger(age) || age < 0) {
      throw new Error(`${field} must be a non-negative integer`);
    }

    this.criteria[field] = age;
    return this;
  }

  // Escape special characters for literal regex matching
  escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Create a case-insensitive partial match
  partialMatch(value) {
    return new RegExp(this.escapeRegex(value), 'i');
  }

  // Create a query for partial MongoDB ObjectId matching
  idMatch(value) {
    return {
      $expr: {
        $regexMatch: {
          input: { $toString: '$_id' },
          regex: this.escapeRegex(value),
          options: 'i'
        }
      }
    };
  }

  // Basic search: name OR ID
  setSearch(search) {
    return this.setText('search', search);
  }

  // Advanced filter: patient name
  setName(name) {
    return this.setText('name', name);
  }

  // Advanced filter: patient ID
  setId(id) {
    return this.setText('id', id);
  }

  // Advanced filter: minimum age
  setMinAge(minAge) {
    return this.setAge('minAge', minAge);
  }

  // Advanced filter: maximum age
  setMaxAge(maxAge) {
    return this.setAge('maxAge', maxAge);
  }

  // Advanced filter: ward ID
  setWard(ward) {
    return this.setText('ward', ward);
  }

  // Advanced filter: gender
  setGender(gender) {
    return this.setText('gender', gender);
  }

  // Advanced filter: medication
  setMedication(medication) {
    return this.setText('medication', medication);
  }

  // Sorting
  setSortBy(field) {
      // Ignore omitted or empty values; retain default
      if (field === undefined || field === null || field === '') {
        return this;
      }

      // Only allow supported patient fields
      const allowedFields = [
        'name',
        'dateOfBirth',
        'gender',
        'ward'
      ];

      if (!allowedFields.includes(field)) {
        throw new Error('Invalid sorting field');
      } 

      this.sortBy = field;
      return this;
    }
  
  setSortOrder(order) {
    // Ignore omitted or empty values; retain default
    if (order === undefined || order === null || order === '') {
      return this;
    }

    if (order !== 'asc' && order !== 'desc') {
      throw new Error('Invalid sorting order');
    }

    this.sortOrder = order;
    return this;
  }   
    
    buildSort() {
      const direction = this.sortOrder === 'asc' ? 1 : -1;

      return {
        [this.sortBy]: direction
      };
    }

  // Construct the MongoDB query filter
  build() {
    const conditions = [];

    // Validate age range
    if (
      this.criteria.minAge !== undefined &&
      this.criteria.maxAge !== undefined &&
      this.criteria.minAge > this.criteria.maxAge
    ) {
      throw new Error(
        'Minimum age cannot be greater than maximum age'
      );
    }

    // Basic search: name OR patient ID
    if (this.criteria.search) {
      conditions.push({
        $or: [
          { name: this.partialMatch(this.criteria.search) },
          this.idMatch(this.criteria.search)
        ]
      });
    }

    // Filter by patient name
    if (this.criteria.name) {
      conditions.push({
        name: this.partialMatch(this.criteria.name)
      });
    }

    // Filter by patient ID
    if (this.criteria.id) {
      conditions.push(this.idMatch(this.criteria.id));
    }

    // Filter by ward reference
    if (this.criteria.ward) {
      if (!/^[a-fA-F0-9]{24}$/.test(this.criteria.ward)) {
        throw new Error('Invalid ward ID');
      }

      conditions.push({
        ward: new mongoose.Types.ObjectId(this.criteria.ward)
      });
    }

    // Filter by gender
    if (this.criteria.gender) {
      const gender = this.escapeRegex(this.criteria.gender);

      conditions.push({
        gender: new RegExp(`^${gender}$`, 'i')
      });
    }

    // Filter by medication name
    if (this.criteria.medication) {
      conditions.push({
        'medications.name': this.partialMatch(
          this.criteria.medication
        )
      });
    }

    // Filter by age range using date of birth
    if (
      this.criteria.minAge !== undefined ||
      this.criteria.maxAge !== undefined
    ) {
      const today = new Date();

      const year = today.getUTCFullYear();
      const month = today.getUTCMonth();
      const day = today.getUTCDate();

      const dateRange = {};

      // Minimum age: patient must be at least this old
      if (this.criteria.minAge !== undefined) {
        const minAge = this.criteria.minAge;

        // Born before the day after the cutoff birthday
        dateRange.$lt = new Date(
          Date.UTC(year - minAge, month, day + 1)
        );
      }

      // Maximum age: patient must not exceed this age
      if (this.criteria.maxAge !== undefined) {
        const maxAge = this.criteria.maxAge;

        // Born after the cutoff birthday
        dateRange.$gt = new Date(
          Date.UTC(year - maxAge - 1, month, day)
        );
      }

      conditions.push({
        dateOfBirth: dateRange
      });
    }

    // Return all patients if no criteria are specified
    if (conditions.length === 0) {
      return {};
    }

    // Return a single condition directly
    if (conditions.length === 1) {
      return conditions[0];
    }

    // Combine multiple criteria using AND
    return {
      $and: conditions
    };
  }
}

module.exports = PatientQueryBuilder;
