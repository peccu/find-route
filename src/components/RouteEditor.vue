<template>
  <div>
    <form @submit.prevent="onSave" class="space-y-3">
      <div>
        <label class="block text-sm">ルート名</label>
        <input v-model="form.name" class="w-full border rounded p-2" />
      </div>

      <div>
        <label class="block text-sm">備考</label>
        <input v-model="form.notes" class="w-full border rounded p-2" />
      </div>

      <div class="space-y-2">
        <h4 class="font-medium">区間（Leg）</h4>
        <div v-for="(leg, idx) in form.legs" :key="leg.id" class="p-2 border rounded bg-gray-50">
          <div class="flex justify-between items-center mb-2">
            <div class="text-sm font-semibold">#{{ idx + 1 }} - {{ leg.type }}</div>
            <div class="flex gap-2">
              <button type="button" @click="moveUp(idx)" :disabled="idx===0" class="px-2 py-1 bg-gray-200 rounded cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50">↑</button>
              <button type="button" @click="moveDown(idx)" :disabled="idx===form.legs.length-1" class="px-2 py-1 bg-gray-200 rounded cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50">↓</button>
              <button type="button" @click="removeLeg(idx)" class="px-2 py-1 bg-red-300 rounded cursor-pointer">削除</button>
            </div>
          </div>

          <div v-if="leg.type === 'walk'">
            <label class="text-sm block">徒歩時間（分）</label>
            <input type="number" v-model.number="(leg as any).durationMinutes" class="border rounded p-1 w-32" />
          </div>

          <div v-else>
            <label class="text-sm block">路線名</label>
            <input v-model="(leg as any).line" class="border rounded p-1 w-full" />
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label class="text-sm block">出発駅</label>
                <input v-model="(leg as any).from" class="border rounded p-1 w-full" />
              </div>
              <div>
                <label class="text-sm block">到着駅</label>
                <input v-model="(leg as any).to" class="border rounded p-1 w-full" />
              </div>
            </div>
            <div class="mt-2">
              <label class="text-sm block">時刻表（カンマ区切り hh:mm）</label>
              <input v-model="timetableInputs[idx]" class="border rounded p-1 w-full" />
            </div>
            <div class="mt-2">
              <label class="text-sm block">参考URL (時刻表URLなど)</label>
              <div class="flex gap-2">
                <input v-model="(leg as any).url" class="border rounded p-1 w-full" />
                <button type="button" @click="open(idx)" :disabled="!(leg as any).url" class="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer flex-shrink-0 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50">Open</button>
              </div>
            </div>
            <div class="mt-2">
              <label class="text-sm block">乗車時間（分）</label>
              <input type="number" v-model.number="(leg as any).durationMinutes" class="border rounded p-1 w-32" />
            </div>
          </div>
        </div>

        <div class="flex gap-2 mt-2">
          <button type="button" @click="addWalk" class="px-3 py-1 bg-green-400 rounded cursor-pointer">徒歩区間を追加</button>
          <button type="button" @click="addTrain" class="px-3 py-1 bg-indigo-400 text-white rounded cursor-pointer">電車/バス区間を追加</button>
        </div>
      </div>

      <div class="flex gap-2">
        <button class="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer">保存</button>
        <button type="button" @click="$emit('cancel')" class="px-3 py-2 bg-gray-200 rounded cursor-pointer">キャンセル</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRaw } from 'vue'
import type { Route, Leg } from '../types'
import { uid } from '../utils'
import { parseTimetableString } from '../utils'

export default defineComponent({
  props: {
    initial: { type: Object as () => Route | undefined, default: undefined }
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const form = reactive<Route>(props.initial ? JSON.parse(JSON.stringify(props.initial)) : {
      id: uid('route_'),
      name: '',
      legs: [],
      notes: ''
    } as Route)

    // timetableのテキスト入力を各train leg用に保持
    const timetableInputs = reactive<string[]>(form.legs.map(l => l.type === 'train' ? (l as any).timetable.map((m:number)=> {
      const hh = Math.floor(m/60).toString().padStart(2,'0')
      const mm = (m%60).toString().padStart(2,'0')
      return `${hh}:${mm}`
    }).join(', ') : ''))

    function addWalk() {
      form.legs.push({ id: uid('leg_'), type: 'walk', durationMinutes: 5 } as Leg)
      timetableInputs.push('')
    }
    function addTrain() {
      form.legs.push({ id: uid('leg_'), type: 'train', line: '', from: '', to: '', timetable: [], url: '', durationMinutes: 10 } as Leg)
      timetableInputs.push('')
    }

    const open = async (idx:number) =>  {
      if (form.legs[idx].type == 'walk' || !form.legs[idx].url){
        return;
      }
      window.open(form.legs[idx].url);
    }

    function removeLeg(idx:number) {
      form.legs.splice(idx,1)
      timetableInputs.splice(idx,1)
    }

    function moveUp(idx:number){ if(idx<=0) return; const a = form.legs.splice(idx,1)[0]; form.legs.splice(idx-1,0,a); const t = timetableInputs.splice(idx,1)[0]; timetableInputs.splice(idx-1,0,t) }
    function moveDown(idx:number){ if(idx>=form.legs.length-1) return; const a = form.legs.splice(idx,1)[0]; form.legs.splice(idx+1,0,a); const t = timetableInputs.splice(idx,1)[0]; timetableInputs.splice(idx+1,0,t) }

    function onSave() {
      // parse timetable inputs into minutes
      form.legs.forEach((leg, idx) => {
        if ((leg as any).type === 'train') {
          const tstr = timetableInputs[idx] ?? ''
          ;(leg as any).timetable = parseTimetableString(tstr)
        }
      })
      emit('save', JSON.parse(JSON.stringify(toRaw(form))))
    }

    return { open, form, addWalk, addTrain, removeLeg, moveUp, moveDown, onSave, timetableInputs }
  }
})
</script>
