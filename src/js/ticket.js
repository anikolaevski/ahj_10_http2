class Ticket {
  constructor(obj) {
    this.id = Math.random().toString(16).slice(2);
    this.name = obj.name;
    this.description = obj.description;
    this.status = 'new';
    this.created = new Date();
  }

  update(newStatus) {
    this.status = newStatus;
  }
}

module.exports = {
  Ticket,
};
