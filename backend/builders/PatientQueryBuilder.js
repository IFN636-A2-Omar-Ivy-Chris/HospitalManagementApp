
class PatientQueryBuilder {

  constructor() {
    this.criteria = {};
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

  // Basic search: name or ID
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

  // Advanced filter: ward
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

  // Construct the final query configuration
  build() {

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

    // Return a separate immutable query configuration
    return Object.freeze({ ...this.criteria });
  }
}

module.exports = PatientQueryBuilder;
