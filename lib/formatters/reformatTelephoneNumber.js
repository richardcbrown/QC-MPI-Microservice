/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | http://www.synanetics.com                                                |
 | Email: support@synanetics.com                                            |
 |                                                                          |
 | Author: Richard Brown                                                    |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  17 Jan 2020

*/

'use strict';

module.exports = function (demographicsResponse) {

  const { demographics } = demographicsResponse;

  console.log(demographics);

  //format telephone number to reintroduce leading 0
  if (typeof demographics.phone === 'number') {
    let formatted = `${demographics.phone}`;

    formatted = formatted.length === 10 ? `0${formatted}` : formatted;

    demographics.phone = formatted;
  }


  return demographicsResponse;
};