'use strict';

(function () {

	function CircleService($resource, User, $q, Util, $http, BNut, $rootScope) {
		var safeCb = Util.safeCb;
		var resCircle = $resource('/api/circles/:id/:controller', {
			id: '@_id'
		}, {
				findUserCircles: {
					method: 'GET',
					isArray: true,
					params: {
						id: 'user'
					}
				},
				findCirclesForJoin: {
					method: 'GET',
					isArray: true,
					params: {
						id: 'joinable'
					}
				},
				joinCircle: {
					method: 'POST',
					params: {
						id: 'joinCircle'
					}
				},
				findJoinedCircles: {
					method: 'GET',
					isArray: true,
					params: {
						id: 'joined'
					}
				}
			});
		var resCollab = $resource('/api/collabs/:id/:controller', {
			id: '@_id'
		}, {
				bulkCreate: {
					method: 'POST',
					isArray: true,
					params: {
						id: 'bulk'
					}
				}
			});
		var resCollabRole = $resource('/api/collabs/roles/:id/:controller', {
			id: '@_id'
		}, {
				update: {
					method: 'PUT'
				}
			});

		var service = {};

		//working on circle table

		service.findCircle = function (circleData) {

			if ((angular.isNumber(circleData) && circleData > 0) || angular.isNumber(parseInt(circleData))) {
				return resCircle.get({ id: circleData }).$promise.then(function(circle) {
					var spaces = circle.spaces;
					var collabs = circle.collabs;
					collabs.forEach(function (collab) {
						spaces.forEach(function(space){
							if(collab.spaceId === space._id){
								space.collabs = space.collabs || [];
								space.collabs.push(collab);
							}
						})
					})
					return $q.when(circle);
				})
			}

			if (angular.isObject(circleData)) {
				return resCircle.get(circleData).$promise.then(function(circle){
					var spaces = circle.spaces;
					var collabs = circle.collabs;
					collabs.forEach(function (collab) {
						spaces.forEach(function(space){
							if(collab.spaceId === space._id){
								space.collabs = space.collabs || [];
								space.collabs.push(collab);
							}
						})
					})
					return $q.when(circle);
				})
			}

			//otherwise return error
			$q.reject('fail to find circle, please provide valide params!');
		}

		service.find = function (circleData) {
			return this.findCircle(circleData);
		}

		service.findAllCircle = function (circleData) {

			if (angular.isObject(circleData)) {
				return resCircle.query(circleData).$promise;
			}

			//otherwise return error
			$q.reject('fail to find circles, please provide valide params!');
		}

		service.createCircle = function (circleData) {

			var collabs;
			var proms = [];
			var that = this;
			var circle;

			if (angular.isObject(circleData)) {

				if (!circleData.spaceId) {
					circleData.spaceId = $rootScope.current.space._id;
				}

				return resCircle.save(circleData).$promise;

				/*
				return resCircle.save(circleData).$promise.then(function (result) {
					circle = result;
					//read config to get default collabs for circle
					var path = '/components/blyn/cores/circle/config.json';
					return $http.get(path).then(function (config) {
						var circleTypes = config.data.circleTypes;
						var collabs = circleTypes[circle.type.name]["defaultCollabs"];
						collabs.forEach(function (collab) {
							collab.space = $rootScope.current.space._id;
						})
						if (angular.isObject(collabs)) {
							return resCollab.bulkCreate(collabs).$promise.then(function (results) {
								//after create collabs for circle, also need to add collab role according 
								//to config
								results.forEach(function (o) {
									collabs.forEach(function (c) {
										if (c.name == o.name) {
											proms.push(that.addCollabParentRole({
												collabId: o._id,
												parentRoles: c.parentRoles
											}))
										}
									})
								});
								return $q.all(proms);
								//find circle again after create collabs
								//return resCircle.find(circle._id).$promise;
							}).$promise.then(function(){
								return resCircle.find(circle._id).$promise;
							})
						} else {
							return circle;
						}
					})
				})*/
			}

			//otherwise return error
			$q.reject('fail to create circle, please provide valide params!');
		}

		service.updateCircle = function (updateData, findData) {

			if (updateData && angular.isObject(updateData)) {

				if (findData && angular.isObject(findData)) {

					this.find(findData).then(function (circle) {

						updateData.id = circle._id;

						return resCircle.update(updatedData).$promise;
					})
				}
				else {
					return resCircle.update(updatedData).$promise;
				}
			}

			//otherwise return error
			$q.reject('fail to update circles, please provide valide params!');
		}

		service.deleteCircle = function (circleData) {

			if (angular.isNumber(circleData) && circleData > 0) {

				return resCircle.destroy({
					_id: circleData
				});
			}

			//otherwise return error
			$q.reject('fail to destroy circle, please provide valide params!');
		}

		//working on collab table
		/*
				service.findCollab = function (collabData) {
		
					if (angular.isNumber(collabData) && collabData > 0) {
						return resCollab.get({ id: collabData }).$promise;
					}
		
					if (angular.isObject(collabData)) {
						return resCollab.get(collabData).$promise;
					}
		
					//otherwise return error
					$q.reject('fail to find circle, please provide valide params!');
				}
		
				service.findAllCollab = function (collabData) {
		
					if (angular.isObject(collabData)) {
						return resCollab.query(collabData).$promise;
					}
		
					//otherwise return error
					$q.reject('fail to find collab, please provide valide params!');
				}
		
				service.createCollab = function (collabData) {
		
					if (angular.isObject(collabData)) {
						return resCollab.save(collabData).$promise;
					}
		
					//otherwise return error
					$q.reject('fail to create collab, please provide valide params!');
				}
		
				service.updateCollab = function (updateData, findData) {
		
					if (updateData && angular.isObject(updateData)) {
		
						if (findData && angular.isObject(findData)) {
		
							this.find(findData).then(function (collab) {
		
								updateData.id = collab._id;
		
								return resCollab.update(updatedData).$promise;
							})
						}
						else {
							return resCollab.update(updatedData).$promise;
						}
					}
		
					//otherwise return error
					$q.reject('fail to update collab, please provide valide params!');
				}
		
				service.deleteCollab = function (collabData) {
		
					if (angular.isNumber(collabData) && collabData > 0) {
		
						return resCollab.destroy({
							_id: collabData
						});
					}
		
					//otherwise return error
					$q.reject('fail to destroy collab, please provide valide params!');
				}
		
				//working on collab role table
		
				service.findCollabRole = function (collabRoleData) {
		
					if (angular.isNumber(collabRoleData) && collabRoleData > 0) {
						return resCollab.findCollabRole({ id: collabRoleData }).$promise;
					}
		
					if (angular.isObject(collabRoleData)) {
						return resCollabRole.get(collabRoleData).$promise;
					}
		
					//otherwise return error
					$q.reject('fail to find collab role, please provide valide params!');
				}
		
				service.findAllCollabRole = function (collabRoleData) {
		
					if (angular.isObject(collabRoleData)) {
						return resCollabRole.findAllCollabRole(collabRoleData).$promise;
					}
		
					//otherwise return error
					$q.reject('fail to find collab roles, please provide valide params!');
				}
		
				service.addCollabRole = function (collabRoleData) {
		
					if (angular.isObject(collabRoleData)) {
						return resCollab.addCollabRole(collabRoleData).$promise;
					}
		
					//otherwise return error
					$q.reject('fail to create collab, please provide valide params!');
				}
		
				service.deleteCollabRole = function (collabRoleData) {
		
					if (angular.isNumber(collabRoleData) && collabRoleData > 0) {
		
						return resCollabRole.destroyCollabRole({
							_id: collabRoleData
						});
					}
		
					//otherwise return error
					$q.reject('fail to destroy collab role, please provide valide params!');
				}
		
				//special functions
				//find user's nuts under some collab
				service.findAllUserCollabNut = function (findData) {
		
					return BRole.findAll({
						userId: $rootScope.current.user.id
					}).then(function (roles) {
						var roleIdList = [];
						roles.forEach(function (role) {
							roleIdList.push(role._id);
						});
						return this.findAllCollabRole({
							roleIdList: roleIdList,
							id: 'findAllJoinRoleByRoleList'
						}).$promise;
					}).then(function (joinRoles) {
						return BNut.findAll({
							roles: joinRoles
						})
					});
				}
				*/

		service.findUserJoinedCircles = function (findData) {
			var spaceId = $rootScope.current.space._id;
			if (angular.isObject(findData) && findData.spaceId) {
				spaceId = findData.spaceId;
			}
			return resCircle.findUserCircles({ spaceId: spaceId, userId: $rootScope.current.user._id }).$promise;
		}

		service.findUserLocalCircles = function (findData) {
			return this.findAllCircle(findData).then(function (circles) {
				return BNut.findUserNutPermits(
					{
						userId: $rootScope.current.user._id,
						nutId: $rootScope.current.nut._id
					}
				).then(function (nutPermits) {
					circles.forEach(function (circle) {
						circle.userNutPermits = nutPermits;
					})
					return $q.when(circles);
				});
			});
		}

		service.findCirclesForJoin = function (findData) {
			var spaceId = $rootScope.current.space._id;
			if (findData && findData.spaceId && findData.spaceId > 0) {
				spaceId = findData.spaceId;
			}
			return resCircle.findCirclesForJoin({ spaceId: spaceId }).$promise;
		}

		service.findJoinedCircles = function (findData) {
			var spaceId = $rootScope.current.space._id;
			if (findData && findData.spaceId && findData.spaceId > 0) {
				spaceId = findData.spaceId;
			}
			return resCircle.findJoinedCircles({ spaceId: spaceId }).$promise;
		}

		/**
		 * add space into circle
		 */
		service.joinCircle = function (circle,space) {
			var spaceId = $rootScope.current.space._id;
			if (angular.isObject(space)) {
				spaceId = space._id;
			}

			return resCircle.joinCircle({
				circleId: circle._id,
				spaceId: spaceId
			}).$promise;
		}

		return service;
	}

	angular.module('billynApp.core')
		.factory('BCircle', CircleService);

})();
